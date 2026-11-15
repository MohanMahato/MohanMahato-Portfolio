-- =====================================================================
-- LOCAL TESTING ONLY. Do NOT run this on your real Supabase project.
-- Supabase already has all of this built in. This file imitates the small parts
-- of Supabase our migrations rely on, so we can test them on a plain PostgreSQL.
-- =====================================================================

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon')          then create role anon          nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role')  then create role service_role  nologin bypassrls; end if;
end
$$;

create schema if not exists auth;
create schema if not exists storage;
grant usage on schema auth, storage to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;

create table if not exists auth.users (
  id    uuid primary key default gen_random_uuid(),
  email text unique
);

-- Same logic as Supabase's auth.uid(): reads the user id from the request JWT settings.
create or replace function auth.uid() returns uuid
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;
grant execute on function auth.uid() to anon, authenticated;

create table if not exists storage.buckets (
  id                 text primary key,
  name               text not null,
  public             boolean default false,
  file_size_limit    bigint,
  allowed_mime_types text[]
);

create table if not exists storage.objects (
  id        uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name      text,
  owner     uuid
);
alter table storage.objects enable row level security;

-- Supabase hands out broad default permissions on public tables; imitate that,
-- so our migration's "revoke" step is really tested.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
grant all on all tables in schema storage to anon, authenticated, service_role;
