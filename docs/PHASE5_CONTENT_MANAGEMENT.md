# Phase 5 — Admin Content Management

This phase adds admin-only CRUD screens on top of the Phase 4 authentication and the existing Phase 3 schema. It does not replace the database or change existing RLS policies.

## Included managers
Profile, academics, skills, coding profiles, projects, internships, certifications, hackathons, research, achievements, professional links, learning timeline, and website settings.

## Use
1. Keep the Phase 3 and Phase 4 backups.
2. Copy the existing `.env` into this project's root (same folder as package.json).
3. Run `npm ci`, `npm run lint`, `npm test`, `npm run build`, then `npm run dev`.
4. Log in at `/admin/login` and open a section in the sidebar.
5. Save records as drafts; publish only verified information.

## Database
Uses the existing table and column names in `supabase/all_in_one.sql`. No Phase 5 migration is required. RLS remains the authority for writes. If a query returns a permission or missing-column error, stop and compare the deployed database with the included migrations; do not disable RLS.

## Limitations / next pass
Academic subject and private marksheet sub-record management, direct file upload workflows, and project gallery management are left for a subsequent refinement rather than being simulated. File path fields accept existing bucket paths or public URLs. Never put a service-role key in `.env`.
