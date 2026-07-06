-- Log wysłanych przypomnień cron, żeby nie duplikować powiadomień.

create table if not exists public.scheduled_reminder_log (
  reminder_key text primary key,
  created_at timestamptz not null default now()
);

alter table public.scheduled_reminder_log enable row level security;

create policy "scheduled_reminder_log_service_only"
  on public.scheduled_reminder_log
  for all
  using (false)
  with check (false);
