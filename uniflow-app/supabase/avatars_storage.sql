-- =============================================================================
-- AVATAR STORAGE SETUP — run in Supabase Dashboard → SQL Editor
-- =============================================================================
-- Your profiles.avatar_url column is already correct (text, nullable).
-- This script only creates the Storage bucket + access policies.
--
-- After running, verify with:
--   select id, name, public from storage.buckets where id = 'avatars';
-- You should see one row: avatars | avatars | true
-- =============================================================================

-- Step 1: Create the bucket (policies alone are not enough)
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'avatars') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values (
      'avatars',
      'avatars',
      true,
      2097152,
      array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    );
  else
    update storage.buckets
    set
      public = true,
      file_size_limit = 2097152,
      allowed_mime_types = array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    where id = 'avatars';
  end if;
end $$;

-- Step 2: Storage policies (safe to re-run)
drop policy if exists "Avatar images are publicly accessible" on storage.objects;
drop policy if exists "Users can upload their own avatar" on storage.objects;
drop policy if exists "Users can update their own avatar" on storage.objects;
drop policy if exists "Users can replace their own avatar" on storage.objects;

create policy "Avatar images are publicly accessible"
on storage.objects for select
to public
using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own avatar"
on storage.objects for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can replace their own avatar"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Step 3: Verify
select id, name, public, file_size_limit
from storage.buckets
where id = 'avatars';