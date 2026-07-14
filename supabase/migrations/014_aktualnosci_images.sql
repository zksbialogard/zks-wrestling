-- Zdjęcia do aktualności: tablica obiektów { "url": "...", "storagePath": "gallery/news/..." }
alter table public.aktualnosci
  add column if not exists images jsonb not null default '[]'::jsonb;

comment on column public.aktualnosci.images is
  'Tablica zdjęć powiązanych z aktualnością (url + storagePath do Supabase Storage).';
