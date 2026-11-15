-- =====================================================================
-- Migration 1/6: helper functions + admin_users table
-- Run the 6 migration files in order (1 -> 6). Safe to run again.
-- =====================================================================

-- A) Auto-update "updated_at" whenever a row is edited.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Nobody needs to call this directly (it only runs from triggers).
revoke all on function public.set_updated_at() from public, anon, authenticated;

-- B) admin_users: the allow-list of people who may manage the portfolio.
--    Only YOUR user id goes here. See supabase/manual/make_admin.sql
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.admin_users is
  'Allow-list of admin accounts. Rows are added manually from the SQL Editor only.';

-- C) is_admin(): true only if the logged-in user is listed in admin_users.
--    SECURITY DEFINER lets it read admin_users even though normal users cannot.
--    search_path is locked to prevent search-path hijacking.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;
