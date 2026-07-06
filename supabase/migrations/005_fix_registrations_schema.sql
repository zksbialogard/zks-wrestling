-- Naprawa tabeli registrations (brakujące kolumny / stary schemat)
-- Uruchom w Supabase → SQL Editor jeśli widzisz błąd:
-- "Could not find the 'child_birth_year' column of 'registrations'"

-- Jeśli tabela w ogóle nie istnieje — utwórz od zera:
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  child_id text not null,
  parent_uid text not null,
  child_name text not null default '',
  child_surname text not null default '',
  child_birth_year text not null default '',
  child_gender text not null default '',
  child_weight text not null default '',
  parent_phone text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Dodaj brakujące kolumny (bezpieczne — nie psuje istniejących danych)
alter table public.registrations add column if not exists event_id uuid;
alter table public.registrations add column if not exists child_id text;
alter table public.registrations add column if not exists parent_uid text;
alter table public.registrations add column if not exists child_name text not null default '';
alter table public.registrations add column if not exists child_surname text not null default '';
alter table public.registrations add column if not exists child_birth_year text not null default '';
alter table public.registrations add column if not exists child_gender text not null default '';
alter table public.registrations add column if not exists child_weight text not null default '';
alter table public.registrations add column if not exists parent_phone text;
alter table public.registrations add column if not exists status text not null default 'pending';
alter table public.registrations add column if not exists created_at timestamptz not null default now();
alter table public.registrations add column if not exists updated_at timestamptz not null default now();

-- Stare nazwy camelCase → snake_case (jeśli kiedyś utworzono ręcznie)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and column_name = 'childBirthYear'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and column_name = 'child_birth_year'
  ) then
    alter table public.registrations rename column "childBirthYear" to child_birth_year;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and column_name = 'childName'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and column_name = 'child_name'
  ) then
    alter table public.registrations rename column "childName" to child_name;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and column_name = 'childSurname'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and column_name = 'child_surname'
  ) then
    alter table public.registrations rename column "childSurname" to child_surname;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and column_name = 'eventId'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and column_name = 'event_id'
  ) then
    alter table public.registrations rename column "eventId" to event_id;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and column_name = 'parentUid'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'registrations' and column_name = 'parent_uid'
  ) then
    alter table public.registrations rename column "parentUid" to parent_uid;
  end if;
end $$;

create unique index if not exists registrations_event_child_uidx
  on public.registrations (event_id, child_id);

create index if not exists registrations_event_status_idx
  on public.registrations (event_id, status);

create index if not exists registrations_parent_uid_idx
  on public.registrations (parent_uid, created_at desc);

alter table public.registrations enable row level security;

drop policy if exists "registrations_service_only" on public.registrations;

create policy "registrations_service_only"
  on public.registrations
  for all
  using (false)
  with check (false);

-- Odśwież cache API Supabase (PostgREST)
notify pgrst, 'reload schema';
