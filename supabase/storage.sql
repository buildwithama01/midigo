-- ============================================================
--  MIDIGO — Supabase Storage Setup
--  Run this in: Supabase → SQL Editor → Run
--  ============================================================

-- ─── Create Storage Buckets ─────────────────────────────────────
-- avatars: profile pictures (public read, 5 MB limit)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- media: shared assets — images, video, audio, documents (50 MB limit)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/webm', 'audio/mpeg', 'audio/ogg', 'audio/wav',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit
    , allowed_mime_types = excluded.allowed_mime_types;

-- ─── Row Level Security on storage.objects ─────────────────────
-- The storage.objects table has RLS enabled by default in PostgREST.
-- We define policies per bucket.

-- ── Avatars bucket ───────────────────────────────────────────────

-- Anyone can read avatar images (they're public)
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Authenticated users can upload an avatar to their own folder
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update (overwrite) their own avatar
create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own avatar
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ── Media bucket ─────────────────────────────────────────────────

-- Authenticated users can read media assets
create policy "Media is accessible to authenticated users"
  on storage.objects for select
  using (
    bucket_id = 'media'
    and auth.role() = 'authenticated'
  );

-- Authenticated users can upload media
create policy "Users can upload media"
  on storage.objects for insert
  with check (
    bucket_id = 'media'
    and auth.uid() is not null
  );

-- Users can delete their own media uploads
create policy "Users can delete their own media uploads"
  on storage.objects for delete
  using (
    bucket_id = 'media'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );
