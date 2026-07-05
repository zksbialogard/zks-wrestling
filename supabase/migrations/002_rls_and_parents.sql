-- Publiczny odczyt zawodów i aktualności + kontakty rodziców do powiadomień

create table if not exists public.parent_users (
  uid text primary key,
  email text not null,
  telefon text,
  imie text,
  nazwisko text,
  rola text not null default 'rodzic',
  updated_at timestamptz not null default now()
);

alter table public.parent_users enable row level security;

drop policy if exists "parent_users_service_only" on public.parent_users;
create policy "parent_users_service_only"
  on public.parent_users
  for all
  using (false)
  with check (false);

alter table public.events enable row level security;
alter table public.aktualnosci enable row level security;

drop policy if exists "events_public_read" on public.events;
create policy "events_public_read"
  on public.events
  for select
  to anon, authenticated
  using (true);

drop policy if exists "aktualnosci_public_read" on public.aktualnosci;
create policy "aktualnosci_public_read"
  on public.aktualnosci
  for select
  to anon, authenticated
  using (true);

-- Istniejący rodzic z Firebase (możesz dodać kolejnych w ten sam sposób)
insert into public.parent_users (uid, email, telefon, imie, nazwisko, rola)
values (
  'vO3GxrpJlfZqDUQ9ATVnCjKNtVp2',
  'andzia1206@op.pl',
  '570120678',
  'Angelika',
  'Ciesielska',
  'rodzic'
)
on conflict (uid) do update set
  email = excluded.email,
  telefon = excluded.telefon,
  imie = excluded.imie,
  nazwisko = excluded.nazwisko,
  rola = excluded.rola,
  updated_at = now();
