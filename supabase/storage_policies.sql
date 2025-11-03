-- Storage policies for avatars bucket
-- Run this in Supabase SQL editor after creating a public bucket named 'avatars'

-- Public read for avatar images
create policy "Public read avatars"
on storage.objects for select
using (bucket_id = 'avatars');

-- Allow authenticated users to upload only within their own folder (user id prefix)
create policy "Users can upload own avatars"
on storage.objects for insert
for role authenticated
with check (
  bucket_id = 'avatars'
  and left(name, 36) = auth.uid()::text
);

-- Allow users to update files in their own folder
create policy "Users can update own avatars"
on storage.objects for update
for role authenticated
using (
  bucket_id = 'avatars'
  and left(name, 36) = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and left(name, 36) = auth.uid()::text
);

-- Allow users to delete files in their own folder
create policy "Users can delete own avatars"
on storage.objects for delete
for role authenticated
using (
  bucket_id = 'avatars'
  and left(name, 36) = auth.uid()::text
);
