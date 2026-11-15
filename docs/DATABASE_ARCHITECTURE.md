# Database Architecture (Phase 3)

Beginner-friendly explanation of how the Supabase database is built and why.

## 1. Big picture

```
Visitor's browser ──(publishable key)──► Supabase ──► PostgreSQL tables
Admin's browser   ──(publishable key + login token)──►        │
                                                         RLS rules decide
                                                         who sees / changes what
```

- The website talks to Supabase directly. There is no separate backend server.
- The **publishable key** in the frontend is *not* a password. It only says "this request comes from my website".
  What a request may do is decided inside the database by **Row Level Security (RLS)**.
- The **secret / service_role key** can bypass RLS, so it must never be in the frontend, `.env`, or GitHub.

### Two locks on every table
1. **GRANT** (table permission): which role may touch the table at all.
2. **RLS policy** (row permission): which rows that role may read or change.

| Who | Role | Can do |
|---|---|---|
| Visitor (not logged in) | `anon` | Read rows where `is_published = true` |
| Logged-in non-admin | `authenticated` | Same as a visitor. Cannot write |
| Admin (you) | `authenticated` + listed in `admin_users` | Read everything, insert / update / delete |

## 2. Tables (13 required + 5 supporting)

| Table | Purpose | Notes |
|---|---|---|
| `profiles` | Name, headline, intro, programme, current semester, CGPA, resume path | Exactly 1 row (`id = 1`) |
| `academic_records` | **One row per semester, 1 to 8** | `semester_number` unique, 1..8, SGPA/credits/status optional |
| `skills` | Technical skills | `category` text (Languages, Tools, ...) |
| `coding_profiles` | LeetCode, CodeChef, ... | URL must be http(s) |
| `projects` | Your projects | Unique `slug`, tech stack array, status |
| `internships` | Internships | Optional link to a certificate |
| `certifications` | Certificates | Files in `certificates` bucket |
| `hackathons` | Hackathons | Optional link to a certificate |
| `research` | Papers, patents, prototypes, ideas | |
| `achievements` | Achievements and leadership | category: achievement / leadership / club_role / award |
| `professional_links` | GitHub, LinkedIn, email | `https://` or `mailto:` only |
| `learning_timeline` | Courses, workshops, self-study | Skills development record |
| `website_settings` | Site title, meta description, default theme | Exactly 1 row |
| `academic_subjects` | Subjects inside a semester (child of `academic_records`) | Deleted with its semester |
| `academic_marksheets` | Marksheet file paths | **Admin only**, never public |
| `project_images` | Gallery images of a project | Deleted with its project |
| `custom_sections` | Future extra sections (blog, volunteering ...) | No database change needed later |
| `admin_users` | Allow-list of admin accounts | Not writable from the app |

### 8 semesters
`academic_records.semester_number` is `1..8` and unique, and migration 6 creates the 8 empty slots.
`year_of_study` is calculated automatically (semesters 1 and 2 = year 1, ... 7 and 8 = year 4).
Nothing is pre-filled: SGPA, marks and CGPA are added by you from the admin panel.

### Common rules
- Primary key: `uuid` (or `id = 1` for single-row tables).
- Foreign keys: `on delete cascade` for children (subjects, images), `on delete set null` for optional links (certificate on an internship).
- `created_at` and `updated_at` on every table; `updated_at` is refreshed automatically by a trigger.
- `is_published` defaults to **false**: new content is a draft until you publish it.
- `metadata jsonb` on main tables: space for future fields without changing the table.
- CHECK constraints: SGPA/CGPA 0 to 10, semester 1 to 8, marks not above max marks, end date not before start date,
  clean slugs, URLs must start with `http://` or `https://`.

## 3. Storage buckets

| Bucket | Public | Limit | Types | Used for |
|---|---|---|---|---|
| `project-images` | yes | 5 MB | jpg, png, webp | Project covers and screenshots |
| `profile-photos` | yes | 2 MB | jpg, png, webp | Profile photo |
| `certificates` | yes | 5 MB | jpg, png, webp, pdf | Certificates |
| `resumes` | yes | 5 MB | pdf | Public resume download |
| `private-docs` | **no** | 10 MB | jpg, png, pdf | Marksheets and personal documents |

Only admins can list, upload, replace or delete. Visitors can open a public file only if they know its exact URL.
SVG is blocked everywhere. The admin panel (Phase 5) will use random UUID file names.

## 4. The SQL files, explained

All files are in `supabase/migrations/`. Run them in order. Each one is safe to run again.

| # | File | What it does (simple words) |
|---|---|---|
| 1 | `20261111000100_helpers_and_admin.sql` | Makes a small function that stamps `updated_at` automatically, the `admin_users` list, and `is_admin()`, a yes/no function the security rules ask: "is this logged-in person an admin?" |
| 2 | `20261111000200_core_tables.sql` | Builds all the tables with their columns, primary keys, foreign keys, timestamps and CHECK rules. Nothing is visible to anyone yet |
| 3 | `20261111000300_triggers_and_indexes.sql` | Attaches the `updated_at` trigger to every table and adds indexes so joins stay fast |
| 4 | `20261111000400_rls_and_grants.sql` | The security file. Turns RLS on for every table, removes Supabase's broad default permissions, gives visitors read-only access and creates the admin-only write policies |
| 5 | `20261111000500_storage.sql` | Creates the 5 buckets with size and type limits, and the admin-only upload / delete policies |
| 6 | `20261111000600_seed_structure.sql` | Creates the 8 empty academic slots, 1 profile row (just your name) and 1 settings row. No marks, projects or fake data |

Extra files:
- `supabase/all_in_one.sql`: files 1 to 6 joined for one paste (`npm run db:bundle` rebuilds it).
- `supabase/manual/make_admin.sql`: makes your account the admin (run once by hand).
- `supabase/tests/rls_verification.sql`: security test (rolls back everything).
- `supabase/tests/local_stub.sql` and `run_local.sh`: run everything on a local PostgreSQL.

Future changes: add a NEW file (for example `20270101000000_add_blog.sql`). Never edit a migration you already ran.

## 5. Secure admin account plan

1. **Create the user by hand** in Supabase: Authentication, Users, Add user (strong, unique password, Auto Confirm).
2. **Allow-list it:** run `supabase/manual/make_admin.sql` (adds your user id to `admin_users`). This is the only way to become admin.
3. **Disable public sign-up:** Authentication, Sign In / Providers, turn off "Allow new users to sign up".
4. **Defense in depth:** even if someone created an account anyway, they are not in `admin_users`, so RLS blocks every write
   (this is tested: a logged-in non-admin cannot insert, update, delete, upload, or see the admin list).
5. **MFA (authenticator app):** enabled in Phase 4 together with the login page. Until then, use a strong password.
6. Keep the Database Password and Secret key in a password manager. Never put them in the code or on GitHub.
7. If you ever lose admin access: use the SQL Editor (it runs as the project owner) to add or fix a row in `admin_users`.

## 6. Environment variables

Only these two, both in `.env` (never committed):

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

On Vercel (Phase 8), add the same two under Project Settings, Environment Variables.
The build stops with a clear error if a `VITE_` variable looks like a secret key.

## 7. Future expansion

- New section type: use `custom_sections` (title, slug, body, metadata) with no migration.
- Extra fields on existing content: put them in the `metadata` JSON column, or add a column in a new migration.
- Multiple admins later: add more rows to `admin_users`.
