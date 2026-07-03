-- =============================================================================
-- RESOURCES STORAGE BUCKET SETUP
-- =============================================================================
-- Run this in Supabase Dashboard → SQL Editor (after creating the resources table).
--
-- This creates the "resources" storage bucket (public for downloads) and
-- basic policies so lecturers can upload files.
--
-- After running, verify:
--   select id, name, public from storage.buckets where id = 'resources';
-- =============================================================================

-- Step 1: Create (or update) the bucket
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'resources') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values (
      'resources',
      'resources',
      true,                 -- public bucket so getPublicUrl works for students/lecturers
      52428800,             -- 50MB limit per file
      null                  -- allow any mime types (pdf, images, docs, etc.)
    );
  else
    update storage.buckets
    set
      public = true,
      file_size_limit = 52428800
    where id = 'resources';
  end if;
end $$;

-- Step 2: Storage object policies (safe to re-run)
drop policy if exists "Resources are publicly downloadable" on storage.objects;
drop policy if exists "Authenticated users can upload resources" on storage.objects;
drop policy if exists "Users can update their own resource files" on storage.objects;
drop policy if exists "Users can delete their own resource files" on storage.objects;

-- Anyone (even unauthenticated for simplicity) can download via public URL
create policy "Resources are publicly downloadable"
on storage.objects for select
to public
using (bucket_id = 'resources');

-- Any authenticated user can upload (UI + table RLS will restrict who can actually do it)
create policy "Authenticated users can upload resources"
on storage.objects for insert
to authenticated
with check (bucket_id = 'resources');

-- Users can replace files they "own" (by path prefix — here we allow any authenticated for uploaded content)
create policy "Users can update their own resource files"
on storage.objects for update
to authenticated
using (bucket_id = 'resources');

create policy "Users can delete their own resource files"
on storage.objects for delete
to authenticated
using (bucket_id = 'resources');

-- Step 3: Verify
select id, name, public, file_size_limit
from storage.buckets
where id = 'resources';