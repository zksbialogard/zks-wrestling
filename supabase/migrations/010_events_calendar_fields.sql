-- Rozszerzenie kalendarza imprez (zawody, zgrupowania, sezon).

alter table public.events
  add column if not exists event_type text not null default 'zawody',
  add column if not exists end_date date,
  add column if not exists age_category text,
  add column if not exists season integer,
  add column if not exists notes text;

create index if not exists events_season_date_idx
  on public.events (season, event_date);
