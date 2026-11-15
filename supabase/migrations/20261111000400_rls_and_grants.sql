-- =====================================================================
-- Migration 4/6: Row Level Security (RLS) + permissions
--
-- Security model (two locks on every table):
--   Lock 1 (GRANT): which database roles may even touch the table.
--   Lock 2 (RLS)  : which ROWS a role may see or change.
--
--   anon          = a visitor who is not logged in
--   authenticated = a logged-in user (still needs to be in admin_users to write)
--
-- Result:
--   * Visitors   : read-only, and only rows where is_published = true
--   * Admin      : read everything (drafts too), insert / update / delete
--   * Everyone else who logs in: same as a visitor (cannot write)
--   * Not exposed at all to visitors: admin_users, academic_marksheets
-- =====================================================================

-- 1) Turn RLS ON for every table (no policy = no access).
do $$
declare
  t text;
begin
  foreach t in array array[
    'admin_users', 'profiles', 'website_settings', 'academic_records', 'academic_subjects',
    'academic_marksheets', 'skills', 'coding_profiles',
    'certifications', 'projects', 'project_images', 'internships', 'hackathons',
    'research', 'achievements', 'professional_links', 'learning_timeline', 'custom_sections'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end
$$;

-- 2) Lock 1: remove Supabase's broad default permissions, then grant only what is needed.
revoke all on all tables in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;

-- Visitors may only READ these tables (RLS then filters to published rows).
grant select on
  public.profiles, public.website_settings, public.academic_records, public.academic_subjects,
  public.skills, public.coding_profiles, public.certifications,
  public.projects, public.project_images, public.internships, public.hackathons,
  public.research, public.achievements, public.professional_links,
  public.learning_timeline, public.custom_sections
to anon;

-- Logged-in users get full table permissions; RLS below still limits writes to admins.
grant select, insert, update, delete on
  public.profiles, public.website_settings, public.academic_records, public.academic_subjects,
  public.academic_marksheets, public.skills, public.coding_profiles,
  public.certifications, public.projects, public.project_images, public.internships,
  public.hackathons, public.research, public.achievements,
  public.professional_links, public.learning_timeline, public.custom_sections
to authenticated;

-- admin_users: a logged-in user may only READ (their own row). Never writable from the app.
grant select on public.admin_users to authenticated;

-- 3) Lock 2: policies.

-- 3a) admin_users: you can see only your own row.
drop policy if exists "Read own admin row" on public.admin_users;
create policy "Read own admin row" on public.admin_users
  for select to authenticated
  using (user_id = (select auth.uid()));

-- 3b) Tables that have their own is_published column.
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'academic_records', 'skills', 'coding_profiles', 'certifications',
    'projects', 'internships', 'hackathons', 'research', 'achievements',
    'professional_links', 'learning_timeline', 'custom_sections'
  ]
  loop
    execute format('drop policy if exists "Read published or admin" on public.%I', t);
    execute format(
      'create policy "Read published or admin" on public.%I
         for select to anon, authenticated
         using (is_published or (select public.is_admin()))', t);
  end loop;
end
$$;

-- 3c) Child tables: visible only if the child AND its parent are published.
--     (skills is now a plain table with its own is_published flag - see 3b.)
drop policy if exists "Read published or admin" on public.academic_subjects;
create policy "Read published or admin" on public.academic_subjects
  for select to anon, authenticated
  using (
    (select public.is_admin())
    or (is_published and exists (
          select 1 from public.academic_records s
          where s.id = academic_record_id and s.is_published))
  );

drop policy if exists "Read published or admin" on public.project_images;
create policy "Read published or admin" on public.project_images
  for select to anon, authenticated
  using (
    (select public.is_admin())
    or exists (
          select 1 from public.projects p
          where p.id = project_id and p.is_published)
  );

-- 3d) website_settings: title / theme only, nothing private, so everyone may read it.
drop policy if exists "Read site settings" on public.website_settings;
create policy "Read site settings" on public.website_settings
  for select to anon, authenticated
  using (true);

-- 3e) academic_marksheets: admin only (never public).
drop policy if exists "Admin read marksheets" on public.academic_marksheets;
create policy "Admin read marksheets" on public.academic_marksheets
  for select to authenticated
  using ((select public.is_admin()));

-- 3f) Write policies: only admins may insert / update / delete.
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'website_settings', 'academic_records', 'academic_subjects', 'academic_marksheets',
    'skills', 'coding_profiles', 'certifications', 'projects',
    'project_images', 'internships', 'hackathons', 'research',
    'achievements', 'professional_links', 'learning_timeline', 'custom_sections'
  ]
  loop
    execute format('drop policy if exists "Admin insert" on public.%I', t);
    execute format('drop policy if exists "Admin update" on public.%I', t);
    execute format('drop policy if exists "Admin delete" on public.%I', t);
    execute format(
      'create policy "Admin insert" on public.%I
         for insert to authenticated with check ((select public.is_admin()))', t);
    execute format(
      'create policy "Admin update" on public.%I
         for update to authenticated
         using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format(
      'create policy "Admin delete" on public.%I
         for delete to authenticated using ((select public.is_admin()))', t);
  end loop;
end
$$;
