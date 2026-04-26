begin;

-- 1) Shared bootstrap routine for onboarding and integrity jobs.
create or replace function public.bootstrap_user_clinic_context(p_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_clinic_id uuid;
  v_full_name text;
  v_email text;
begin
  if p_user_id is null then
    raise exception 'User id is required';
  end if;

  select
    coalesce(
      nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
      nullif(trim(u.email), ''),
      'Administrador da clínica'
    ),
    u.email
  into v_full_name, v_email
  from auth.users u
  where u.id = p_user_id;

  if v_full_name is null then
    raise exception 'User % not found in auth.users', p_user_id;
  end if;

  -- If user already has an active membership, prefer reusing this clinic.
  select sp.clinic_id
  into v_clinic_id
  from public.staff_profiles sp
  where sp.user_id = p_user_id
    and sp.active = true
  order by sp.created_at asc
  limit 1;

  if v_clinic_id is null then
    insert into public.clinics (name, owner_user_id, email)
    values (
      format('Clínica de %s', split_part(v_full_name, ' ', 1)),
      p_user_id,
      nullif(v_email, '')
    )
    returning id into v_clinic_id;
  end if;

  insert into public.staff_profiles (clinic_id, user_id, full_name, role, active)
  values (v_clinic_id, p_user_id, v_full_name, 'admin', true)
  on conflict (clinic_id, user_id)
  do update set
    full_name = excluded.full_name,
    role = 'admin',
    active = true,
    updated_at = timezone('utc', now());

  insert into public.user_clinic_context (user_id, active_clinic_id)
  values (p_user_id, v_clinic_id)
  on conflict (user_id)
  do update set
    active_clinic_id = excluded.active_clinic_id,
    updated_at = timezone('utc', now());

  return v_clinic_id;
end;
$$;

comment on function public.bootstrap_user_clinic_context(uuid) is
  'Garantia de clínica + perfil admin + contexto ativo para onboarding e backfill.';

-- 2) Trigger in auth.users lifecycle (Supabase default signup flow).
create or replace function public.handle_auth_user_created_bootstrap()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  perform public.bootstrap_user_clinic_context(new.id);
  return new;
end;
$$;

drop trigger if exists trg_auth_users_bootstrap_clinic_context on auth.users;
create trigger trg_auth_users_bootstrap_clinic_context
after insert on auth.users
for each row execute function public.handle_auth_user_created_bootstrap();

-- 3) Integrity check + backfill for legacy users without active clinic context.
create or replace view public.v_users_without_clinic_context as
select
  u.id as user_id,
  u.email,
  u.created_at,
  u.last_sign_in_at
from auth.users u
left join public.user_clinic_context ucc
  on ucc.user_id = u.id
left join public.clinics c
  on c.id = ucc.active_clinic_id
where ucc.user_id is null
   or c.id is null;

create or replace function public.backfill_user_clinic_integrity(p_limit integer default 1000)
returns table (user_id uuid, clinic_id uuid, action text)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid;
  v_clinic_id uuid;
begin
  for v_user_id in
    select v.user_id
    from public.v_users_without_clinic_context v
    order by v.created_at asc
    limit greatest(coalesce(p_limit, 1000), 1)
  loop
    v_clinic_id := public.bootstrap_user_clinic_context(v_user_id);
    user_id := v_user_id;
    clinic_id := v_clinic_id;
    action := 'bootstrapped';
    return next;
  end loop;
end;
$$;

comment on function public.backfill_user_clinic_integrity(integer) is
  'Backfill idempotente para usuários sem user_clinic_context válido.';

-- 4) Optional scheduled job (when pg_cron is available in the project).
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid)
    from cron.job
    where jobname = 'backfill-user-clinic-integrity';

    perform cron.schedule(
      'backfill-user-clinic-integrity',
      '17 * * * *',
      $$select public.backfill_user_clinic_integrity(500);$$
    );
  end if;
end;
$$;

grant select on public.v_users_without_clinic_context to service_role;
grant execute on function public.bootstrap_user_clinic_context(uuid) to service_role;
grant execute on function public.backfill_user_clinic_integrity(integer) to service_role;

commit;
