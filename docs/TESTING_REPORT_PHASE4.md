# Phase 4 Testing Report

Environment: Linux, Node v22.23.4, npm 10.9.9, PostgreSQL 16.15 (plain PostgreSQL, not a real Supabase project).

## Results (actually run)
| Check | Result |
|---|---|
| `npm install` | pass |
| `npm run lint` | pass, 0 errors |
| `npm test` | **46 of 46 pass** (8 test files) |
| `npm run build` | pass; admin code is in separate chunks, not in the public entry file |
| Build with a secret-named `VITE_` variable | fails on purpose (correct) |
| `npm run db:test` (local PostgreSQL) | **42 of 42 checks pass** (Phase 3 had 40; 2 new check the login admin-query) |

## What the 46 frontend tests cover (Supabase is replaced by a fake, no network)
- `/admin` and deeper `/admin/*` routes redirect to `/admin/login` when logged out
- A logged-in admin sees the dashboard, and the check is made with the user's id
- A logged-in user who is not in admin_users sees "Access denied" and no admin data is requested
- Already-logged-in admin opening the login page is sent to the dashboard
- Login success, return to the originally requested page, wrong password message, password field cleared, loading state, double-submit blocked, empty-field message, pause after 5 failures, non-admin refused after a correct login
- Retry after a failed permission check; logout clears session and cached data
- Mobile admin drawer opens and closes
- Password never written to browser storage; no hard-coded user ids or emails; no secret keys in code
- Login without Supabase keys explains the problem and disables the button
- Redirect-safety and friendly-error helper functions

## Bug found and fixed by the tests
`safeAdminRedirect` accepted `/admin//evil.com`. It stayed inside the site, so it was not a real open redirect, but it is now rejected.

## NOT tested (be aware)
- **No real Supabase login was performed.** I have no Supabase project and no network access to Supabase from this environment.
  `signInWithPassword`, session persistence across browser refresh, token refresh and `signOut` were tested only against a fake, not the real service.
- The real `admin_users` query was verified at database level on plain PostgreSQL (with Supabase's `auth.uid()` imitated), not through the real PostgREST API.
- No browser was available: layouts (desktop, tablet, phone) and the dark/light look of the admin screens were not visually checked.
- MFA is not implemented.

## Please verify on your PC
Follow "Try it on your computer" in `docs/PHASE4_ADMIN_AUTH.md` (7 steps) and tell me what you see.
