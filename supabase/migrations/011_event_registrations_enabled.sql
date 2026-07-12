-- Ręczne włączanie/wyłączanie zapisów na imprezę (nadpisuje domyślną logikę wg typu).

alter table public.events
  add column if not exists registrations_enabled boolean;

comment on column public.events.registrations_enabled is
  'null = automatycznie (zgrupowanie bez zapisów, pozostałe z zapisami); true/false = wymuszenie';
