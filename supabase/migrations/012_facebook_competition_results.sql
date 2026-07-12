-- ZKS Białogard — wyniki zawodów synchronizowane z Facebooka
-- Uruchom w Supabase → SQL Editor

create table if not exists public.facebook_competition_results (
  id uuid primary key default gen_random_uuid(),
  facebook_post_id text not null,
  event_title text not null,
  event_date date,
  location text not null default '',
  athlete_name text not null,
  weight_class text not null default '',
  style text not null default '',
  place integer check (place is null or place > 0),
  year integer not null,
  source_url text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (facebook_post_id, athlete_name, place, event_title, style)
);

create index if not exists facebook_competition_results_year_idx
  on public.facebook_competition_results (year, event_date desc);

create index if not exists facebook_competition_results_post_idx
  on public.facebook_competition_results (facebook_post_id);

alter table public.facebook_competition_results enable row level security;

create policy "facebook_competition_results_public_read"
  on public.facebook_competition_results
  for select
  to anon, authenticated
  using (published = true);

create policy "facebook_competition_results_service_only"
  on public.facebook_competition_results
  for all
  using (false)
  with check (false);
