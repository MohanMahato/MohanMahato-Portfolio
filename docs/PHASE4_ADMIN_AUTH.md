# Phase 4: Admin Authentication and Protected Dashboard

## How it works (simple)

```
/admin/login  --email + password-->  Supabase Auth (signInWithPassword)
                                          |
                          saved session (Supabase keeps it in the browser)
                                          |
 /admin, /admin/*  --ProtectedRoute-->  1. Is someone logged in?       no -> /admin/login
                                        2. Is their id in admin_users?  no -> "Access denied"
                                        3. yes -> AdminLayout + page
```

The check in step 2 is the query:
`select user_id from public.admin_users where user_id = <logged-in user id>`.
Phase 3's RLS policy "Read own admin row" lets a logged-in user read only their own row,
and the database validates the login token on the server, so an expired or forged token fails.
**No new SQL migration was needed.** I inspected the Phase 3 files first:
`admin_users.user_id` exists, the policy and `SELECT` grant exist, and `public.is_admin()` exists.

### Two layers of security
1. **Frontend (what screen to show):** AuthProvider + ProtectedRoute. Convenient, but anyone can edit JavaScript in their own browser.
2. **Database (the real protection):** RLS. Even if someone bypasses the screen, the database still refuses reads of drafts, and all writes, for non-admins.
   This is tested in `supabase/tests/rls_verification.sql`.

## New files

| File | Purpose |
|---|---|
| `src/context/AuthProvider.jsx` | Holds session + admin status. Provides `signIn`, `signOut`, `recheck` |
| `src/hooks/useAuth.js` | `useAuth()` hook |
| `src/services/authService.js` | All Supabase Auth calls and the `admin_users` check |
| `src/services/adminService.js` | Dashboard counts (read with the admin's login) |
| `src/routes/AdminRoot.jsx` | Wraps admin routes with AuthProvider (public visitors never load it) |
| `src/routes/ProtectedRoute.jsx` | Login + admin gate |
| `src/components/admin/AdminLayout.jsx`, `AdminSidebar.jsx`, `AdminTopbar.jsx` | Admin frame, mobile drawer, logout |
| `src/components/admin/AccessMessage.jsx`, `FullPageLoader.jsx` | Access denied / error / loading screens |
| `src/pages/admin/AdminLoginPage.jsx` | Login form |
| `src/pages/admin/AdminDashboardPage.jsx` | Dashboard with real counts per table |
| `src/pages/admin/AdminSectionPage.jsx` | Friendly page for sections built in Phase 5 |
| `src/lib/authErrors.js`, `src/lib/safeRedirect.js` | Friendly errors; open-redirect protection |
| `src/config/adminNav.js` | Sidebar items |

Changed: `src/routes/AppRoutes.jsx` (admin routes), `package.json` (`"private"` was the text "true", now a real boolean).
Removed: `src/pages/admin/AdminPlaceholder.jsx` (replaced).

## Security rules followed
- Passwords go only to Supabase and are cleared from the form after every attempt. They are never saved by our code.
  (Supabase itself stores the login *session token* in the browser, which is what keeps you logged in.)
- No user id or email is hard-coded anywhere (a test scans the code for this).
- No secret / service_role key anywhere in the frontend (existing guards still run).
- Same "Incorrect email or password." message for a wrong email or wrong password.
- After 5 wrong attempts the button pauses for 30 seconds (Supabase also rate-limits on the server).
- After login the app returns you only to paths inside `/admin` (no redirect to other websites).
- Logout clears the session and all cached admin data from memory.
- Admin pages are marked `noindex` so search engines skip them.

## Try it on your computer (needs the Phase 3 database set up)
1. `.env` has your Supabase URL and publishable key. `npm install`, `npm run dev`.
2. Open http://localhost:5173/admin. You must be sent to `/admin/login`.
3. Log in with the user you created in Supabase and made admin (`make_admin.sql`).
   You should land on the Dashboard: "Admin access verified" and counts for each section (all 0 for now, that is correct).
4. Click **Logout**. You must return to the login page. Opening `/admin` again must send you back to login.
5. Wrong password: you should see "Incorrect email or password."
6. Optional negative test: create a SECOND user in Supabase (do NOT add it to admin_users) and log in with it.
   You must see "Not authorised" and never the dashboard.
7. Phone-size check: press F12, then Ctrl+Shift+M, width 375. The sidebar becomes a menu button on the top left.

## Not included (on purpose)
- **MFA (authenticator app):** not in this phase's request. It is the next thing I recommend (Phase 4b). Until then use a long, unique password.
- Password reset / "forgot password": there is only one admin; reset it from the Supabase dashboard (Authentication, Users).
- Content editing screens: Phase 5.

## Troubleshooting
| Problem | Fix |
|---|---|
| "Supabase is not configured" on the login page | `.env` missing or wrong. Restart `npm run dev` |
| "Incorrect email or password." for the right password | The user may not exist in this project, or is unconfirmed. Check Authentication, Users |
| "Not authorised" for your own account | Run `supabase/manual/make_admin.sql` with your email |
| "Could not verify admin access" | Network problem, or Phase 3 migrations not run. Press Try again |
| Dashboard shows "Could not load the overview" | Phase 3 migrations incomplete; re-run `supabase/all_in_one.sql` |
