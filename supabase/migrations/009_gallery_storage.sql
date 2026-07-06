-- Bucket na zdjęcia galerii (publiczny odczyt, zapis tylko przez API z service role)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery',
  'gallery',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Gallery public read" on storage.objects;

create policy "Gallery public read"
on storage.objects
for select
to public
using (bucket_id = 'gallery');
