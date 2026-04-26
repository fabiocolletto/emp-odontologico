begin;

-- 1) Clinic owner relationship.
alter table public.clinics
  add column if not exists owner_user_id uuid references auth.users(id);

update public.clinics c
set owner_user_id = sp.user_id
from public.staff_profiles sp
where sp.clinic_id = c.id
  and sp.role = 'admin'
  and c.owner_user_id is null;

alter table public.clinics
  alter column owner_user_id set not null;

create index if not exists idx_clinics_owner_user_id
  on public.clinics(owner_user_id);

-- 2) Clinics can only be created by the authenticated owner.
drop policy if exists "users can create own clinic" on public.clinics;
create policy "users can create own clinic"
on public.clinics
for insert
with check (owner_user_id = auth.uid());

-- 3) Ensure clinic owner gets an active admin staff profile.
create or replace function public.ensure_clinic_owner_staff_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text;
begin
  select coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(u.email), ''),
    'Clinic Owner'
  )
  into v_full_name
  from auth.users u
  where u.id = new.owner_user_id;

  insert into public.staff_profiles (clinic_id, user_id, full_name, role, active)
  values (new.id, new.owner_user_id, coalesce(v_full_name, 'Clinic Owner'), 'admin', true)
  on conflict (clinic_id, user_id)
  do update set
    role = 'admin',
    active = true,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists trg_clinics_ensure_owner_staff_profile on public.clinics;
create trigger trg_clinics_ensure_owner_staff_profile
after insert on public.clinics
for each row execute function public.ensure_clinic_owner_staff_profile();

-- 4) Sensitive clinic updates are restricted to owner/admin in active clinic.
drop policy if exists "admins can update their clinic" on public.clinics;
create policy "owners and admins can update their clinic"
on public.clinics
for update
using (
  id = public.current_clinic_id()
  and (
    owner_user_id = auth.uid()
    or exists (
      select 1
      from public.staff_profiles sp
      where sp.user_id = auth.uid()
        and sp.clinic_id = clinics.id
        and sp.role = 'admin'
        and sp.active = true
    )
  )
)
with check (
  id = public.current_clinic_id()
  and (
    owner_user_id = auth.uid()
    or exists (
      select 1
      from public.staff_profiles sp
      where sp.user_id = auth.uid()
        and sp.clinic_id = clinics.id
        and sp.role = 'admin'
        and sp.active = true
    )
  )
);

commit;
