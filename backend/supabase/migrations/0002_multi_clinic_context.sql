begin;

-- 1) staff_profiles membership can be repeated across clinics, but not duplicated within the same clinic.
alter table public.staff_profiles
  drop constraint if exists staff_profiles_user_id_key;

alter table public.staff_profiles
  add constraint staff_profiles_clinic_id_user_id_key unique (clinic_id, user_id);

-- 2) Persist per-user selected clinic context.
create table if not exists public.user_clinic_context (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active_clinic_id uuid not null references public.clinics(id) on delete cascade,
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger trg_user_clinic_context_set_updated_at
before update on public.user_clinic_context
for each row execute function public.set_updated_at();

alter table public.user_clinic_context enable row level security;

create policy "users can read own clinic context"
on public.user_clinic_context
for select
using (user_id = auth.uid());

-- Direct writes are blocked; updates should go through RPC validation.
create policy "users cannot write clinic context directly"
on public.user_clinic_context
for all
using (false)
with check (false);

-- 3) Resolve active tenant using explicit session context.
create or replace function public.current_clinic_id()
returns uuid
language sql
stable
as $$
  select ucc.active_clinic_id
  from public.user_clinic_context ucc
  where ucc.user_id = auth.uid()
$$;

-- 4) Tighten tenant-scoped policies to selected clinic.
drop policy if exists "admins can update their clinic" on public.clinics;
create policy "admins can update their clinic"
on public.clinics
for update
using (
  id = public.current_clinic_id()
  and exists (
    select 1
    from public.staff_profiles sp
    where sp.user_id = auth.uid()
      and sp.clinic_id = clinics.id
      and sp.role = 'admin'
  )
)
with check (
  id = public.current_clinic_id()
  and exists (
    select 1
    from public.staff_profiles sp
    where sp.user_id = auth.uid()
      and sp.clinic_id = clinics.id
      and sp.role = 'admin'
  )
);

drop policy if exists "admins can manage clinic profiles" on public.staff_profiles;
create policy "admins can manage clinic profiles"
on public.staff_profiles
for all
using (
  staff_profiles.clinic_id = public.current_clinic_id()
  and exists (
    select 1
    from public.staff_profiles me
    where me.user_id = auth.uid()
      and me.clinic_id = staff_profiles.clinic_id
      and me.role = 'admin'
  )
)
with check (
  staff_profiles.clinic_id = public.current_clinic_id()
  and exists (
    select 1
    from public.staff_profiles me
    where me.user_id = auth.uid()
      and me.clinic_id = staff_profiles.clinic_id
      and me.role = 'admin'
  )
);

-- 5) RPC to select active clinic, validating membership first.
create or replace function public.set_active_clinic(p_clinic_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1
    from public.staff_profiles sp
    where sp.user_id = auth.uid()
      and sp.clinic_id = p_clinic_id
      and sp.active = true
  ) then
    raise exception 'User does not belong to this clinic';
  end if;

  insert into public.user_clinic_context (user_id, active_clinic_id)
  values (auth.uid(), p_clinic_id)
  on conflict (user_id)
  do update set
    active_clinic_id = excluded.active_clinic_id,
    updated_at = timezone('utc', now());
end;
$$;

grant execute on function public.set_active_clinic(uuid) to authenticated;

commit;
