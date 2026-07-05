-- Subskrypcje Web Push (powiadomienia na telefon jak w aplikacji)

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_uid text not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_uid_idx
  on public.push_subscriptions (user_uid);

alter table public.push_subscriptions enable row level security;

drop policy if exists "push_subscriptions_service_only" on public.push_subscriptions;
create policy "push_subscriptions_service_only"
  on public.push_subscriptions
  for all
  using (false)
  with check (false);
