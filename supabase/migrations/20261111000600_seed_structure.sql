-- =====================================================================
-- Migration 6/6: structural rows only (NO marks, NO projects, NO fake data)
--   * 8 empty semester slots (Semester 1 ... Semester 8), all unpublished
--   * the single profile row (only your name) and the site-settings row
-- Everything else is filled by you from the Admin Dashboard.
-- =====================================================================

insert into public.academic_records (semester_number, title)
select n, 'Semester ' || n
from generate_series(1, 8) as n
on conflict (semester_number) do nothing;

insert into public.profiles (id, full_name)
values (1, 'Mohan Mahato')
on conflict (id) do nothing;

insert into public.website_settings (id)
values (1)
on conflict (id) do nothing;
