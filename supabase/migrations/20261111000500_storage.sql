-- =====================================================================
-- Migration 5/6: file storage buckets + policies
--
-- Bucket           Public?  Used for                         Max size  Types
-- project-images   YES      project covers and screenshots   5 MB      jpg, png, webp
-- profile-photos   YES      your profile photo / avatar      2 MB      jpg, png, webp
-- certificates     YES      certificate PDFs / images        5 MB      jpg, png, webp, pdf
-- resumes          YES      downloadable resume              5 MB      pdf
-- private-docs     NO       marksheets, personal documents   10 MB     jpg, png, pdf
--
-- "Public" bucket = anyone who knows a file's exact URL can open it (that is how the
-- portfolio shows images). Visitors can NOT list or search files, and can NEVER upload.
-- Use random file names (the admin panel will use UUIDs) so URLs cannot be guessed.
-- SVG is not allowed anywhere (SVG files can contain scripts).
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('project-images', 'project-images', true,  5242880,
     array['image/jpeg', 'image/png', 'image/webp']),
  ('profile-photos', 'profile-photos', true,  2097152,
     array['image/jpeg', 'image/png', 'image/webp']),
  ('certificates',   'certificates',   true,  5242880,
     array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  ('resumes',        'resumes',        true,  5242880,
     array['application/pdf']),
  ('private-docs',   'private-docs',   false, 10485760,
     array['image/jpeg', 'image/png', 'application/pdf'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Only admins can list / upload / replace / delete files in OUR buckets.
-- (Files in the public buckets can still be opened by URL.)
drop policy if exists "Portfolio admin can read files"   on storage.objects;
drop policy if exists "Portfolio admin can upload files" on storage.objects;
drop policy if exists "Portfolio admin can update files" on storage.objects;
drop policy if exists "Portfolio admin can delete files" on storage.objects;

create policy "Portfolio admin can read files" on storage.objects
  for select to authenticated
  using (bucket_id in ('project-images', 'profile-photos', 'certificates', 'resumes', 'private-docs')
         and (select public.is_admin()));

create policy "Portfolio admin can upload files" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('project-images', 'profile-photos', 'certificates', 'resumes', 'private-docs')
              and (select public.is_admin()));

create policy "Portfolio admin can update files" on storage.objects
  for update to authenticated
  using (bucket_id in ('project-images', 'profile-photos', 'certificates', 'resumes', 'private-docs')
         and (select public.is_admin()))
  with check (bucket_id in ('project-images', 'profile-photos', 'certificates', 'resumes', 'private-docs')
              and (select public.is_admin()));

create policy "Portfolio admin can delete files" on storage.objects
  for delete to authenticated
  using (bucket_id in ('project-images', 'profile-photos', 'certificates', 'resumes', 'private-docs')
         and (select public.is_admin()));
