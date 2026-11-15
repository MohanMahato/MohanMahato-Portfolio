-- =====================================================================
-- Migration 2/6: all portfolio tables
-- Table names follow the Phase 3 requirement list (profiles, academic_records, ... website_settings).
-- Rules used in every table:
--   * id            : uuid primary key
--   * is_published  : false by default (drafts stay private)
--   * created_at / updated_at timestamps (updated_at is filled automatically)
--   * URL columns   : must start with http:// or https:// (blocks "javascript:" links)
--   * NO phone number is stored anywhere.
--   * Marksheets live in an admin-only table (academic_marksheets).
-- =====================================================================

-- ---------- Profile (exactly ONE row, id = 1) ----------
create table if not exists public.profiles (
  id                       smallint primary key default 1 check (id = 1),
  full_name                text not null,
  headline                 text,
  intro                    text,
  about                    text,
  programme                text,
  university               text,
  current_semester         smallint check (current_semester between 1 and 8),
  admission_year           smallint check (admission_year between 2000 and 2100),
  expected_graduation_year smallint check (expected_graduation_year between 2000 and 2100),
  cgpa                     numeric(4,2) check (cgpa between 0 and 10),
  location                 text,
  contact_email            text check (contact_email is null or contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  career_interest          text,
  avatar_path              text,
  resume_path              text,
  is_published             boolean not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- ---------- Site settings (exactly ONE row, id = 1) ----------
create table if not exists public.website_settings (
  id               smallint primary key default 1 check (id = 1),
  site_title       text not null default 'Mohan Mahato – Professional Portfolio',
  meta_description text,
  og_image_path    text,
  default_theme    text not null default 'dark' check (default_theme in ('dark', 'light')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ---------- Academics: the 8 semesters of the B.Tech journey ----------
create table if not exists public.academic_records (
  id              uuid primary key default gen_random_uuid(),
  semester_number smallint not null unique check (semester_number between 1 and 8),
  year_of_study   smallint generated always as ((semester_number + 1) / 2) stored,
  title           text,
  academic_year   text check (academic_year is null or academic_year ~ '^\d{4}-\d{2,4}$'),
  start_date      date,
  end_date        date,
  status          text not null default 'upcoming' check (status in ('upcoming', 'in_progress', 'completed')),
  sgpa            numeric(4,2) check (sgpa between 0 and 10),
  credits_earned  numeric(5,1) check (credits_earned >= 0),
  remarks         text,
  is_published    boolean not null default false,
  metadata      jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),  -- room for future fields
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create table if not exists public.academic_subjects (
  id             uuid primary key default gen_random_uuid(),
  academic_record_id    uuid not null references public.academic_records (id) on delete cascade,
  subject_code   text,
  subject_name   text not null,
  credits        numeric(3,1) check (credits >= 0),
  grade          text,
  grade_points   numeric(4,2) check (grade_points between 0 and 10),
  marks_obtained numeric(5,2) check (marks_obtained >= 0),
  max_marks      numeric(5,2) check (max_marks > 0),
  display_order  integer not null default 0,
  is_published   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  check (marks_obtained is null or max_marks is null or marks_obtained <= max_marks)
);

-- PRIVATE: marksheet files. Admin-only table, so marksheets are never visible to visitors.
create table if not exists public.academic_marksheets (
  id          uuid primary key default gen_random_uuid(),
  academic_record_id uuid not null references public.academic_records (id) on delete cascade,
  title       text,
  file_path   text not null,  -- file lives in the PRIVATE "private-docs" bucket
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- Skills ----------
create table if not exists public.skills (
  id            uuid primary key default gen_random_uuid(),
  category      text not null default 'General',   -- e.g. Languages, Frameworks, Tools
  name          text not null,
  proficiency   text check (proficiency in ('beginner', 'intermediate', 'advanced')),
  icon          text,
  display_order integer not null default 0,
  is_published  boolean not null default false,
  metadata      jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),  -- room for future fields
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (category, name)
);

-- ---------- Coding profiles (LeetCode, CodeChef, ...) ----------
create table if not exists public.coding_profiles (
  id            uuid primary key default gen_random_uuid(),
  platform      text not null,
  username      text,
  profile_url   text not null check (profile_url ~* '^https?://'),
  stats_note    text,
  display_order integer not null default 0,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- Certifications (before internships/hackathons, which can link to it) ----------
create table if not exists public.certifications (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  issuer         text,
  issue_date     date,
  credential_id  text,
  credential_url text check (credential_url is null or credential_url ~* '^https?://'),
  category       text,
  file_path      text,
  thumbnail_path text,
  display_order  integer not null default 0,
  is_published   boolean not null default false,
  metadata      jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),  -- room for future fields
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------- Projects ----------
create table if not exists public.projects (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  short_description text,
  long_description  text,
  tech_stack        text[] not null default '{}',
  github_url        text check (github_url is null or github_url ~* '^https?://'),
  live_url          text check (live_url is null or live_url ~* '^https?://'),
  cover_image_path  text,
  status            text not null default 'in_progress' check (status in ('planned', 'in_progress', 'completed')),
  is_featured       boolean not null default false,
  start_date        date,
  end_date          date,
  display_order     integer not null default 0,
  is_published      boolean not null default false,
  metadata      jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),  -- room for future fields
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create table if not exists public.project_images (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects (id) on delete cascade,
  image_path    text not null,
  caption       text,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- Internships ----------
create table if not exists public.internships (
  id             uuid primary key default gen_random_uuid(),
  company        text not null,
  role           text not null,
  location       text,
  start_date     date,
  end_date       date,
  description    text,
  certificate_id uuid references public.certifications (id) on delete set null,
  display_order  integer not null default 0,
  is_published   boolean not null default false,
  metadata      jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),  -- room for future fields
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

-- ---------- Hackathons ----------
create table if not exists public.hackathons (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  organizer      text,
  event_date     date,
  role           text,
  project_name   text,
  result         text,
  description    text,
  certificate_id uuid references public.certifications (id) on delete set null,
  display_order  integer not null default 0,
  is_published   boolean not null default false,
  metadata      jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),  -- room for future fields
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ---------- Research & innovation ----------
create table if not exists public.research (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  kind          text check (kind in ('paper', 'patent', 'prototype', 'idea', 'other')),
  description   text,
  link_url      text check (link_url is null or link_url ~* '^https?://'),
  event_date    date,
  display_order integer not null default 0,
  is_published  boolean not null default false,
  metadata      jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),  -- room for future fields
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- Achievements & leadership ----------
create table if not exists public.achievements (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  category      text check (category in ('achievement', 'leadership', 'club_role', 'award', 'other')),
  organization  text,
  event_date    date,
  description   text,
  display_order integer not null default 0,
  is_published  boolean not null default false,
  metadata      jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),  -- room for future fields
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- Professional links (GitHub, LinkedIn, ...) ----------
create table if not exists public.professional_links (
  id            uuid primary key default gen_random_uuid(),
  platform      text not null,
  label         text,
  url           text not null check (url ~* '^(https?://|mailto:)'),
  icon          text,
  display_order integer not null default 0,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- Skills development record (courses, workshops, self-study) ----------
create table if not exists public.learning_timeline (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  kind          text check (kind in ('course', 'workshop', 'self_study', 'other')),
  provider      text,
  start_date    date,
  end_date      date,
  status        text not null default 'in_progress' check (status in ('planned', 'in_progress', 'completed')),
  notes         text,
  display_order integer not null default 0,
  is_published  boolean not null default false,
  metadata      jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),  -- room for future fields
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

-- ---------- Custom sections (future expansion) ----------
-- A flexible "extra section" (e.g. Blog, Volunteering, Publications) you can add later
-- from the admin panel WITHOUT changing the database structure.
create table if not exists public.custom_sections (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  body          text,
  metadata      jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  display_order integer not null default 0,
  is_published  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
