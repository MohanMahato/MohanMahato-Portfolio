# Mohan Mahato – Professional Portfolio

React + Vite (JavaScript) · Tailwind CSS · Framer Motion · Supabase · Vercel

## Run on your computer
1. Install **Node.js 22 LTS (22.22.2 or newer)** from https://nodejs.org (check with `node -v`). Node 24.15+ also works. Older versions (18, 20) will NOT work with the test tools. If you use nvm, run `nvm use` (the `.nvmrc` file picks Node 22).
2. Open this folder in a terminal and run:
   ```
   npm install
   npm run dev
   ```
3. Open http://localhost:5173

## Connect Supabase (free)
Follow the full beginner guide: **[docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)**
(create project -> copy URL + publishable key into `.env` -> run `supabase/all_in_one.sql` -> make admin -> disable sign-up).

NEVER put the Secret / `service_role` key in this project. The build stops if you do.

## Admin login (Phase 4)
See **[docs/PHASE4_ADMIN_AUTH.md](docs/PHASE4_ADMIN_AUTH.md)**. Open `/admin`, log in with the user you made admin in Supabase.

## Commands
| Command | What it does |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Create production build in `dist/` |
| `npm run lint` | Check code for mistakes |
| `npm test` | Run frontend tests |
| `npm run db:bundle` | Rebuild `supabase/all_in_one.sql` from the migrations |
| `npm run db:test` | Test migrations + security rules on a local PostgreSQL (needs `psql`) |

## Push to GitHub
```
git init
git add .
git commit -m "Phase 2: project foundation"
git branch -M main
git remote add origin https://github.com/MohanMahato/<your-repo-name>.git
git push -u origin main
```
`.env` is in `.gitignore`, so your keys are not uploaded.

## Admin content management (Phase 5)
See [docs/PHASE5_CONTENT_MANAGEMENT.md](docs/PHASE5_CONTENT_MANAGEMENT.md). Existing Phase 3 database and Phase 4 authentication are reused.


## Public portfolio and design (Phase 6)
See [docs/PHASE6_DESIGN_AND_PUBLIC_SITE.md](docs/PHASE6_DESIGN_AND_PUBLIC_SITE.md). Six themes are selectable and published portfolio content is read from the existing Supabase tables.
