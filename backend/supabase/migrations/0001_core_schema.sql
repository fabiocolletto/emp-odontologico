-- Supabase baseline schema for OdontoFlow
-- Apply this script in Supabase SQL Editor.

begin;

create extension if not exists pgcrypto;

-- =====================================================
-- Helpers
-- =====================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.current_clinic_id()
returns uuid
language sql
stable
as $$
  select sp.clinic_id
  from public.staff_profiles sp
  where sp.user_id = auth.uid()
  limit 1
$$;

-- =====================================================
-- Core multi-tenant tables
-- =====================================================
create table if not exists public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  tax_id text,
  timezone text not null default 'America/Sao_Paulo',
  phone text,
  email text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.staff_profiles (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin', 'dentist', 'assistant', 'receptionist')),
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- =====================================================
-- Domain tables
-- =====================================================
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  cpf text,
  gender text check (gender in ('Feminino', 'Masculino', 'Não informar')),
  birth_date date,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (clinic_id, cpf)
);

create table if not exists public.procedures (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  name text not null,
  category text,
  duration_minutes integer not null check (duration_minutes > 0),
  base_price numeric(10,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (clinic_id, name)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete restrict,
  procedure_id uuid not null references public.procedures(id) on delete restrict,
  dentist_profile_id uuid references public.staff_profiles(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'confirmed', 'done', 'cancelled', 'no_show')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (ends_at > starts_at)
);

-- =====================================================
-- Indexes
-- =====================================================
create index if not exists idx_staff_profiles_clinic_id on public.staff_profiles(clinic_id);

create index if not exists idx_patients_clinic_name on public.patients(clinic_id, full_name);
create index if not exists idx_patients_clinic_phone on public.patients(clinic_id, phone);

create index if not exists idx_procedures_clinic_active on public.procedures(clinic_id, active);

create index if not exists idx_appointments_clinic_starts_at on public.appointments(clinic_id, starts_at);
create index if not exists idx_appointments_patient_id on public.appointments(patient_id);
create index if not exists idx_appointments_dentist_profile_id on public.appointments(dentist_profile_id);

-- =====================================================
-- Audit triggers
-- =====================================================
create trigger trg_clinics_set_updated_at
before update on public.clinics
for each row execute function public.set_updated_at();

create trigger trg_staff_profiles_set_updated_at
before update on public.staff_profiles
for each row execute function public.set_updated_at();

create trigger trg_patients_set_updated_at
before update on public.patients
for each row execute function public.set_updated_at();

create trigger trg_procedures_set_updated_at
before update on public.procedures
for each row execute function public.set_updated_at();

create trigger trg_appointments_set_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

-- =====================================================
-- Row Level Security
-- =====================================================
alter table public.clinics enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.patients enable row level security;
alter table public.procedures enable row level security;
alter table public.appointments enable row level security;

-- clinics
create policy "clinic members can read their clinic"
on public.clinics
for select
using (id = public.current_clinic_id());

create policy "admins can update their clinic"
on public.clinics
for update
using (
  exists (
    select 1
    from public.staff_profiles sp
    where sp.user_id = auth.uid()
      and sp.clinic_id = clinics.id
      and sp.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.staff_profiles sp
    where sp.user_id = auth.uid()
      and sp.clinic_id = clinics.id
      and sp.role = 'admin'
  )
);

-- staff_profiles
create policy "staff can read clinic profiles"
on public.staff_profiles
for select
using (clinic_id = public.current_clinic_id());

create policy "admins can manage clinic profiles"
on public.staff_profiles
for all
using (
  exists (
    select 1
    from public.staff_profiles me
    where me.user_id = auth.uid()
      and me.clinic_id = staff_profiles.clinic_id
      and me.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.staff_profiles me
    where me.user_id = auth.uid()
      and me.clinic_id = staff_profiles.clinic_id
      and me.role = 'admin'
  )
);

-- patients
create policy "staff can read patients in clinic"
on public.patients
for select
using (clinic_id = public.current_clinic_id());

create policy "staff can insert patients in clinic"
on public.patients
for insert
with check (clinic_id = public.current_clinic_id());

create policy "staff can update patients in clinic"
on public.patients
for update
using (clinic_id = public.current_clinic_id())
with check (clinic_id = public.current_clinic_id());

-- procedures
create policy "staff can read procedures in clinic"
on public.procedures
for select
using (clinic_id = public.current_clinic_id());

create policy "admins can manage procedures in clinic"
on public.procedures
for all
using (
  clinic_id = public.current_clinic_id()
  and exists (
    select 1
    from public.staff_profiles me
    where me.user_id = auth.uid()
      and me.clinic_id = procedures.clinic_id
      and me.role in ('admin', 'dentist')
  )
)
with check (
  clinic_id = public.current_clinic_id()
  and exists (
    select 1
    from public.staff_profiles me
    where me.user_id = auth.uid()
      and me.clinic_id = procedures.clinic_id
      and me.role in ('admin', 'dentist')
  )
);

-- appointments
create policy "staff can read appointments in clinic"
on public.appointments
for select
using (clinic_id = public.current_clinic_id());

create policy "staff can create appointments in clinic"
on public.appointments
for insert
with check (clinic_id = public.current_clinic_id());

create policy "staff can update appointments in clinic"
on public.appointments
for update
using (clinic_id = public.current_clinic_id())
with check (clinic_id = public.current_clinic_id());

commit;
