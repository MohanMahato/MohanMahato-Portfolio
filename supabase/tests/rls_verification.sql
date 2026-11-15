-- =====================================================================
-- RLS / security verification
--
-- Works in the Supabase SQL Editor AND on plain PostgreSQL (with local_stub.sql).
-- It creates temporary TEST rows, checks who can see / change what, and then
-- ROLLS BACK everything, so your real data is never changed.
--
-- How to read the result:
--   * Each check prints  "PASS: ..."  (shown in the "Messages"/"Results" area).
--   * If anything is wrong the script stops with an ERROR that says "FAIL: ...".
--   * Admin checks need ONE admin to exist (see supabase/manual/make_admin.sql).
--     If there is none, they are skipped and you will see "SKIPPED".
-- =====================================================================

begin;

-- ---------- Test data (created as the database owner; rolled back at the end) ----------
insert into public.projects (id, title, slug, is_published, updated_at) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'TEST published project', 'zz-test-published', true,  '2000-01-01'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'TEST draft project',     'zz-test-draft',     false, '2000-01-01');

insert into public.project_images (project_id, image_path) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'zz-img-of-published.webp'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'zz-img-of-draft.webp');

-- Semester 1 published, semester 2 not published.
update public.academic_records set is_published = true  where semester_number = 1;
update public.academic_records set is_published = false where semester_number = 2;

insert into public.academic_subjects (academic_record_id, subject_name, is_published)
select id, 'TEST subject published in published semester', true  from public.academic_records where semester_number = 1;
insert into public.academic_subjects (academic_record_id, subject_name, is_published)
select id, 'TEST subject DRAFT in published semester',     false from public.academic_records where semester_number = 1;
insert into public.academic_subjects (academic_record_id, subject_name, is_published)
select id, 'TEST subject published in DRAFT semester',     true  from public.academic_records where semester_number = 2;

insert into public.academic_marksheets (academic_record_id, title, file_path)
select id, 'TEST marksheet', 'zz-marksheet.pdf' from public.academic_records where semester_number = 1;

insert into public.skills (category, name, is_published) values
  ('TEST', 'TEST skill published', true),
  ('TEST', 'TEST skill draft',     false);

-- Remember one real admin (if any) for the admin checks.
select set_config('test.admin_id',
                  coalesce((select user_id::text from public.admin_users limit 1), ''),
                  true) as admin_id_for_test;

-- =====================================================================
-- PART A: a visitor who is NOT logged in  (role: anon)
-- =====================================================================
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '', true);

do $$
declare n int;
begin
  select count(*) into n from public.projects where slug like 'zz-test-%';
  if n <> 1 then raise exception 'FAIL A1: visitor should see 1 published project, saw %', n; end if;
  raise notice 'PASS A1: visitor sees only the published project';

  select count(*) into n from public.project_images where image_path like 'zz-img-%';
  if n <> 1 then raise exception 'FAIL A2: visitor should see 1 image (of the published project), saw %', n; end if;
  raise notice 'PASS A2: images of draft projects are hidden';

  select count(*) into n from public.academic_records where semester_number in (1, 2);
  if n <> 1 then raise exception 'FAIL A3: visitor should see 1 published semester, saw %', n; end if;
  raise notice 'PASS A3: unpublished semesters are hidden';

  select count(*) into n from public.academic_subjects where subject_name like 'TEST subject%';
  if n <> 1 then raise exception 'FAIL A4: visitor should see exactly 1 subject, saw %', n; end if;
  raise notice 'PASS A4: subjects need BOTH subject and semester published';

  select count(*) into n from public.skills where name like 'TEST skill%';
  if n <> 1 then raise exception 'FAIL A5: visitor should see exactly 1 skill, saw %', n; end if;
  raise notice 'PASS A5: draft skills are hidden';

  select count(*) into n from public.website_settings;
  if n <> 1 then raise exception 'FAIL A6: visitor should be able to read website_settings, saw % rows', n; end if;
  raise notice 'PASS A6: website_settings is readable';
end
$$;

do $$
begin
  begin
    perform count(*) from public.admin_users;
    raise exception 'FAIL A7: visitor could read admin_users';
  exception when insufficient_privilege then
    raise notice 'PASS A7: visitor cannot read admin_users';
  end;

  begin
    perform count(*) from public.academic_marksheets;
    raise exception 'FAIL A8: visitor could read academic_marksheets';
  exception when insufficient_privilege then
    raise notice 'PASS A8: visitor cannot read marksheets';
  end;

  begin
    insert into public.projects (title, slug) values ('hack', 'zz-hack');
    raise exception 'FAIL A9: visitor could insert a project';
  exception when insufficient_privilege then
    raise notice 'PASS A9: visitor cannot insert';
  end;

  begin
    update public.projects set title = 'hacked' where slug = 'zz-test-published';
    raise exception 'FAIL A10: visitor could update a project';
  exception when insufficient_privilege then
    raise notice 'PASS A10: visitor cannot update';
  end;

  begin
    delete from public.projects where slug = 'zz-test-published';
    raise exception 'FAIL A11: visitor could delete a project';
  exception when insufficient_privilege then
    raise notice 'PASS A11: visitor cannot delete';
  end;

  begin
    insert into storage.objects (bucket_id, name) values ('project-images', 'zz-hack.png');
    raise exception 'FAIL A12: visitor could upload a file';
  exception when insufficient_privilege then
    raise notice 'PASS A12: visitor cannot upload files';
  end;
end
$$;

reset role;

-- =====================================================================
-- PART B: a logged-in user who is NOT an admin  (role: authenticated)
-- =====================================================================
set local role authenticated;
select set_config('request.jwt.claim.sub', '99999999-9999-9999-9999-999999999999', true);
select set_config('request.jwt.claims',
                  '{"sub":"99999999-9999-9999-9999-999999999999","role":"authenticated"}', true);

do $$
declare n int;
begin
  select count(*) into n from public.projects where slug like 'zz-test-%';
  if n <> 1 then raise exception 'FAIL B1: non-admin should see 1 published project, saw %', n; end if;
  raise notice 'PASS B1: non-admin user sees only published content';

  select count(*) into n from public.academic_marksheets;
  if n <> 0 then raise exception 'FAIL B2: non-admin saw % marksheets', n; end if;
  raise notice 'PASS B2: non-admin cannot see marksheets';

  select count(*) into n from public.admin_users;
  if n <> 0 then raise exception 'FAIL B3: non-admin saw % admin rows', n; end if;
  raise notice 'PASS B3: non-admin cannot see admin list';

  select count(*) into n from public.admin_users where user_id = (select auth.uid());
  if n <> 0 then raise exception 'FAIL B3b: the login admin-check returned % rows for a non-admin', n; end if;
  raise notice 'PASS B3b: the login admin-check query returns nothing for a non-admin';

  update public.projects set title = 'hacked' where slug = 'zz-test-published';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL B4: non-admin updated % rows', n; end if;
  raise notice 'PASS B4: non-admin update changes 0 rows';

  delete from public.projects where slug = 'zz-test-published';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL B5: non-admin deleted % rows', n; end if;
  raise notice 'PASS B5: non-admin delete removes 0 rows';

  begin
    insert into public.projects (title, slug) values ('hack', 'zz-hack');
    raise exception 'FAIL B6: non-admin could insert a project';
  exception when insufficient_privilege then
    raise notice 'PASS B6: non-admin cannot insert';
  end;

  begin
    insert into public.admin_users (user_id) values ('99999999-9999-9999-9999-999999999999');
    raise exception 'FAIL B7: user could make themselves admin';
  exception when insufficient_privilege then
    raise notice 'PASS B7: nobody can add themselves to admin_users';
  end;

  begin
    insert into storage.objects (bucket_id, name) values ('private-docs', 'zz-hack.pdf');
    raise exception 'FAIL B8: non-admin could upload to private-docs';
  exception when insufficient_privilege then
    raise notice 'PASS B8: non-admin cannot upload files';
  end;
end
$$;

reset role;

-- =====================================================================
-- PART C: the admin (needs one row in admin_users)
-- =====================================================================
do $$
begin
  if current_setting('test.admin_id', true) is null or current_setting('test.admin_id', true) = '' then
    raise notice 'SKIPPED PART C: no admin exists yet. Create one (supabase/manual/make_admin.sql) and run this file again.';
  end if;
end
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('test.admin_id'), true);
select set_config('request.jwt.claims',
                  json_build_object('sub', current_setting('test.admin_id'), 'role', 'authenticated')::text, true);

do $$
declare n int;
begin
  if current_setting('test.admin_id', true) = '' then return; end if;

  select count(*) into n from public.projects where slug like 'zz-test-%';
  if n <> 2 then raise exception 'FAIL C1: admin should see 2 projects (draft too), saw %', n; end if;
  raise notice 'PASS C1: admin sees drafts';

  select count(*) into n from public.academic_marksheets;
  if n < 1 then raise exception 'FAIL C2: admin cannot see marksheets'; end if;
  raise notice 'PASS C2: admin can read marksheets';

  select count(*) into n from public.admin_users;
  if n <> 1 then raise exception 'FAIL C3: admin should see only their own admin row, saw %', n; end if;
  raise notice 'PASS C3: admin sees only own admin row';

  -- The exact query the Phase 4 login uses: select user_id from admin_users where user_id = <my id>
  select count(*) into n from public.admin_users where user_id = (select auth.uid());
  if n <> 1 then raise exception 'FAIL C3b: the app''s admin check returned % rows for the admin', n; end if;
  select count(*) into n from public.admin_users where user_id = gen_random_uuid();
  if n <> 0 then raise exception 'FAIL C3c: admin could see someone else''s admin row'; end if;
  raise notice 'PASS C3b: the login admin-check query works for the admin and only shows their own row';

  insert into public.projects (title, slug) values ('TEST created by admin', 'zz-test-created');
  raise notice 'PASS C4: admin can insert';

  update public.projects set title = 'TEST edited' where slug = 'zz-test-published';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL C5: admin update changed % rows', n; end if;
  if (select updated_at from public.projects where slug = 'zz-test-published') < timestamptz '2001-01-01' then
    raise exception 'FAIL C5b: updated_at trigger did not run';
  end if;
  raise notice 'PASS C5: admin can update and updated_at refreshes automatically';

  delete from public.projects where slug = 'zz-test-draft';
  get diagnostics n = row_count;
  if n <> 1 then raise exception 'FAIL C6: admin delete removed % rows', n; end if;
  select count(*) into n from public.project_images where image_path = 'zz-img-of-draft.webp';
  if n <> 0 then raise exception 'FAIL C6b: project images were not deleted with their project'; end if;
  raise notice 'PASS C6: admin can delete (images are removed with the project)';

  insert into storage.objects (bucket_id, name)
  select id, 'zz-admin-test' from storage.buckets
  where id in ('project-images', 'profile-photos', 'certificates', 'resumes', 'private-docs');
  get diagnostics n = row_count;
  if n <> 5 then raise exception 'FAIL C7: admin could upload to % of 5 buckets', n; end if;
  raise notice 'PASS C7: admin can upload to all 5 buckets';

  begin
    insert into public.admin_users (user_id) values (gen_random_uuid());
    raise exception 'FAIL C8: even the admin could write to admin_users from the app';
  exception when insufficient_privilege then
    raise notice 'PASS C8: admin_users cannot be changed from the app (SQL Editor only)';
  end;
end
$$;

-- Data-quality rules (CHECK constraints) - tested as admin.
do $$
begin
  if current_setting('test.admin_id', true) = '' then return; end if;

  begin
    insert into public.projects (title, slug, github_url) values ('x', 'zz-bad-url', 'javascript:alert(1)');
    raise exception 'FAIL C9: a javascript: URL was accepted';
  exception when check_violation then
    raise notice 'PASS C9: javascript: URLs are rejected';
  end;

  begin
    insert into public.projects (title, slug) values ('x', 'Bad Slug!');
    raise exception 'FAIL C10: an invalid slug was accepted';
  exception when check_violation then
    raise notice 'PASS C10: invalid slugs are rejected';
  end;

  begin
    insert into public.academic_records (semester_number) values (9);
    raise exception 'FAIL C11: semester 9 was accepted';
  exception when check_violation then
    raise notice 'PASS C11: only semesters 1 to 8 are allowed';
  end;

  begin
    insert into public.academic_records (semester_number) values (1);
    raise exception 'FAIL C12: duplicate semester 1 was accepted';
  exception when unique_violation then
    raise notice 'PASS C12: a semester cannot be duplicated';
  end;

  begin
    update public.academic_records set sgpa = 11 where semester_number = 1;
    raise exception 'FAIL C13: SGPA 11 was accepted';
  exception when check_violation then
    raise notice 'PASS C13: SGPA must be between 0 and 10';
  end;

  begin
    insert into public.profiles (id, full_name) values (2, 'Second profile');
    raise exception 'FAIL C14: a second profile row was accepted';
  exception when check_violation then
    raise notice 'PASS C14: profile can only have one row';
  end;

  begin
    insert into public.academic_subjects (academic_record_id, subject_name, marks_obtained, max_marks)
    select id, 'x', 120, 100 from public.academic_records where semester_number = 1;
    raise exception 'FAIL C15: marks above max marks were accepted';
  exception when check_violation then
    raise notice 'PASS C15: marks cannot exceed max marks';
  end;
end
$$;

reset role;

-- =====================================================================
-- PART D: structure checks (as owner)
-- =====================================================================
do $$
declare n int;
begin
  select count(distinct semester_number) into n from public.academic_records where semester_number between 1 and 8;
  if n <> 8 then raise exception 'FAIL D1: expected 8 semester slots, found %', n; end if;
  raise notice 'PASS D1: all 8 academic record slots exist';

  -- every table the requirements list must exist
  select count(*) into n from information_schema.tables
  where table_schema = 'public' and table_name in (
    'profiles', 'academic_records', 'skills', 'coding_profiles', 'projects', 'internships',
    'certifications', 'hackathons', 'research', 'achievements', 'professional_links',
    'learning_timeline', 'website_settings');
  if n <> 13 then raise exception 'FAIL D2: expected the 13 required tables, found %', n; end if;
  raise notice 'PASS D2: all 13 required tables exist';

  -- RLS must be ON for EVERY table in the public schema
  select count(*) into n from pg_class c join pg_namespace ns on ns.oid = c.relnamespace
  where ns.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;
  if n <> 0 then raise exception 'FAIL D3: % public table(s) have RLS switched OFF', n; end if;
  raise notice 'PASS D3: RLS is enabled on every public table';

  -- every public table must have created_at and updated_at (except admin_users: created_at only)
  select count(*) into n from information_schema.tables t
  where t.table_schema = 'public' and t.table_type = 'BASE TABLE' and t.table_name <> 'admin_users'
    and (select count(*) from information_schema.columns c
         where c.table_schema = 'public' and c.table_name = t.table_name
           and c.column_name in ('created_at', 'updated_at')) <> 2;
  if n <> 0 then raise exception 'FAIL D4: % table(s) miss created_at/updated_at', n; end if;
  raise notice 'PASS D4: all tables have created_at and updated_at';

  -- bucket configuration
  select count(*) into n from storage.buckets
  where (id in ('project-images', 'profile-photos', 'certificates', 'resumes') and public = true)
     or (id = 'private-docs' and public = false);
  if n <> 5 then raise exception 'FAIL D5: bucket public/private flags are wrong'; end if;
  select count(*) into n from storage.buckets
  where id in ('project-images', 'profile-photos', 'certificates', 'resumes', 'private-docs')
    and (allowed_mime_types is null or file_size_limit is null or 'image/svg+xml' = any (allowed_mime_types));
  if n <> 0 then raise exception 'FAIL D6: a bucket has no size/type limit or allows SVG'; end if;
  raise notice 'PASS D5/D6: buckets: 4 public + 1 private, all with size/type limits, no SVG';

  -- the seed must NOT contain fake academic data
  select count(*) into n from public.academic_records
  where sgpa is not null or credits_earned is not null or remarks is not null;
  raise notice 'INFO D7: academic records with marks/remarks: % (expected 0 on a fresh database)', n;
end
$$;

rollback;  -- nothing above is saved
