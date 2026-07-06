-- ZKS Białogard — wyjątki treningowe
-- Uruchom w Supabase → SQL Editor

create table if not exists public.training_exceptions (
  id uuid primary key default gen_random_uuid(),
  group_id text not null check (group_id in ('starsza','srednia','najmlodsza')),
  session_date date not null,
  status text not null check (status in ('cancelled','rescheduled')),
  original_start text,
  original_end text,
  new_start text,
  new_end text,
  message text not null default '',
  created_at timestamptz default now()
);

create index if not exists training_exceptions_group_date_idx
  on public.training_exceptions (group_id, session_date desc);

alter table public.training_exceptions enable row level security;

create policy "training_exceptions_public_read"
  on public.training_exceptions
  for select
  to anon, authenticated
  using (true);

create policy "training_exceptions_service_only"
  on public.training_exceptions
  for all
  using (false)
  with check (false);
