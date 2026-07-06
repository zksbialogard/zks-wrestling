-- ZKS Białogard — zgłoszenia na zawody
-- Uruchom w Supabase → SQL Editor

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  child_id text not null,
  parent_uid text not null,
  child_name text not null,
  child_surname text not null,
  child_birth_year text not null default '',
  child_gender text not null default '',
  child_weight text not null default '',
  parent_phone text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists registrations_event_child_uidx
  on public.registrations (event_id, child_id);

create index if not exists registrations_event_status_idx
  on public.registrations (event_id, status);

create index if not exists registrations_parent_uid_idx
  on public.registrations (parent_uid, created_at desc);

alter table public.registrations enable row level security;

create policy "registrations_service_only"
  on public.registrations
  for all
  using (false)
  with check (false);
