-- =====================================================================
-- Migration 3/6: updated_at triggers + indexes on foreign keys
-- =====================================================================

-- Attach the "updated_at" trigger to every table that has that column.
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
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at()', t);
  end loop;
end
$$;

-- Indexes on foreign keys (PostgreSQL does not create these automatically).
create index if not exists idx_academic_subjects_semester  on public.academic_subjects (academic_record_id);
create index if not exists idx_academic_marksheets_semester on public.academic_marksheets (academic_record_id);
create index if not exists idx_project_images_project      on public.project_images (project_id);
create index if not exists idx_internships_certificate     on public.internships (certificate_id);
create index if not exists idx_hackathons_certificate      on public.hackathons (certificate_id);
