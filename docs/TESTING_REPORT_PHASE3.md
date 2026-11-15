# Phase 3 Testing Report

Date: 11 Nov 2026
Environment: Linux, Node v22.23.4, npm 10.9.9, PostgreSQL 16.15 (plain PostgreSQL, **not** a real Supabase project)

## What was actually tested

### A. SQL migrations on local PostgreSQL (`npm run db:test`)
- Supabase's `auth` and `storage` schemas and the `anon` / `authenticated` roles were **imitated** with `supabase/tests/local_stub.sql`.
  The stub also copies Supabase's default "grant everything" permissions, so the migration's `revoke` step is really exercised.
- All 6 migrations applied on a fresh database: **pass**.
- All 6 migrations applied a second time (re-run safety): **pass**.
- `supabase/all_in_one.sql` applied on a fresh database, then the same 40 security checks re-run: **pass**.
- `supabase/tests/rls_verification.sql`: **40 checks passed, 0 failed.**

| Group | What it proves | Checks |
|---|---|---|
| A (visitor, not logged in) | Sees only published projects, images, academic records, subjects, skills; reads `website_settings`; cannot read `admin_users` or marksheets; cannot insert, update, delete or upload | 12 |
| B (logged-in, not admin) | Same as visitor; update and delete change 0 rows; cannot insert, cannot make themselves admin, cannot upload | 8 |
| C (admin) | Sees drafts and marksheets; insert, update (with automatic `updated_at`), delete (images removed with project); can upload to all 5 buckets; cannot edit `admin_users` from the app; invalid URL, slug, semester 9, duplicate semester, SGPA 11, 2nd profile row and marks above max are rejected | 15 |
| D (structure) | 8 academic record slots; all 13 required tables exist; RLS on every public table; `created_at` and `updated_at` everywhere; 4 public + 1 private bucket with size/type limits and no SVG | 5 |

Mutation checks (deliberately breaking security to prove the tests can fail). Each was caught:
leaking drafts to visitors, letting visitors insert, exposing marksheets, switching RLS off on one table,
letting visitors upload files, making `private-docs` public, leaking draft skills.

### B. Frontend (`npm install`, `npm run lint`, `npm test`, `npm run build`)
- `npm install`: pass
- `npm run lint`: pass, 0 errors
- `npm test`: **20 of 20 tests pass** (5 files): app routes and theme, key guard, no secret keys in source, database status badge (mocked), health check service (mocked)
- `npm run build`: pass
- Build with a `sb_secret_...` value in a `VITE_` variable: **fails on purpose** (correct)

## What was NOT tested
- **Nothing was run against a real Supabase project.** The Supabase SQL Editor, dashboard buttons, Auth settings and real Storage API were not available.
- Storage policies were tested only against the stub `storage.objects` table. Real file uploads with real files were not tested.
- The browser app was not connected to a real database. The "Database connected" badge was tested with a mocked Supabase client.
- MFA and admin login are Phase 4 and not built yet.
- Disabling public sign-up is a dashboard setting. It cannot be tested from code.

## Please run on your real project (after following docs/SUPABASE_SETUP.md)
1. Run `supabase/all_in_one.sql` in the SQL Editor. Expect "Success".
2. Create your admin user and run `supabase/manual/make_admin.sql`. Expect exactly 1 row.
3. Run `supabase/tests/rls_verification.sql`. Expect no red error.
4. Start `npm run dev` and check the home page shows "Configured" and "Database connected".
Send me any error text or screenshot and I will fix it before Phase 4.
