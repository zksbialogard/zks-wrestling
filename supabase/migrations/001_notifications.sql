-- ZKS Białogard — powiadomienia i szablony wiadomości
-- Uruchom w Supabase → SQL Editor

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_uid text not null,
  type text not null default 'general',
  title text not null,
  body text not null,
  link text,
  channels text[] default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_uid_idx
  on public.notifications (user_uid, created_at desc);

create index if not exists notifications_unread_idx
  on public.notifications (user_uid)
  where read_at is null;

create table if not exists public.message_templates (
  key text primary key,
  name text not null,
  subject text not null default '',
  body_text text not null default '',
  body_html text not null default '',
  sms_text text not null default '',
  push_title text not null default '',
  push_body text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.notifications enable row level security;
alter table public.message_templates enable row level security;

-- Aplikacja korzysta z service role po stronie serwera (API routes).
-- Te polityki blokują bezpośredni dostęp anon/authenticated z klienta.
create policy "notifications_service_only"
  on public.notifications
  for all
  using (false)
  with check (false);

create policy "message_templates_service_only"
  on public.message_templates
  for all
  using (false)
  with check (false);
