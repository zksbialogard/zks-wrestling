-- Bucket na filmy klubowe (publiczny odczyt, zapis przez API z service role)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'videos',
  'videos',
  true,
  83886080,
  array['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Videos public read" on storage.objects;

create policy "Videos public read"
on storage.objects
for select
to public
using (bucket_id = 'videos');
