-- ZKS Białogard — wyniki zawodów
-- Uruchom w Supabase → SQL Editor

create table if not exists public.competition_results (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  registration_id uuid references public.registrations(id) on delete set null,
  child_id text,
  parent_uid text,
  athlete_name text not null,
  weight_class text not null default '',
  place integer check (place is null or place > 0),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists competition_results_event_idx
  on public.competition_results (event_id, place);

create index if not exists competition_results_published_idx
  on public.competition_results (published, created_at desc);

create index if not exists competition_results_child_idx
  on public.competition_results (child_id);

alter table public.competition_results enable row level security;

create policy "competition_results_public_read"
  on public.competition_results
  for select
  to anon, authenticated
  using (published = true);

create policy "competition_results_service_only"
  on public.competition_results
  for all
  using (false)
  with check (false);
