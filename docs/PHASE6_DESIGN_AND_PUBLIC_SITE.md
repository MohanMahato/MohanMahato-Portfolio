# Phase 6 — Public Portfolio, Six Themes and Decimal Grades

Phase 6 builds the public-facing portfolio on top of the existing Phase 3 database, Phase 4 authentication and Phase 5 admin managers. It does not add or replace database tables, alter RLS policies, or change Supabase credentials.

## Included
- Six selectable visual themes: Dark Neon, Clean Light, Glassmorphism, Gradient, Editorial and Cyber Tech.
- Theme choice is saved in browser local storage and is available in the public navigation and admin top bar.
- Public homepage reads only published profile, academic, skill, coding profile, project, internship, certification, hackathon, research, achievement, professional link and learning timeline records.
- Projects page reads published project records.
- Empty sections are not filled with invented personal data.
- CGPA and SGPA form fields accept decimal values (for example, 8.75 or 9.25) with browser step set to `any`; values remain numeric and fit the existing `numeric(4,2)` database columns.
- Responsive layouts, reduced-motion support and page metadata.

## Apply to your local Phase 5 project
1. Back up your current Phase 5 folder.
2. Extract this ZIP into a new folder.
3. Copy your existing `.env` from Phase 5 into the new project root (same folder as `package.json`). Never share or upload `.env`.
4. Open the new folder in VS Code terminal.
5. Run `npm ci`.
6. Run `npm run lint`.
7. Run `npm test`.
8. Run `npm run build`.
9. Run `npm run dev` and open the local URL Vite prints.

## Important
- Existing database columns `profiles.cgpa` and `academic_records.sgpa` are already `numeric(4,2)` with a 0–10 check. No SQL migration is needed for decimal values.
- Academic records still need real data and valid date ranges. Do not invent grades, credits or achievements.
- Public content appears only after an admin publishes it.
- Do not add a Supabase service-role key to `.env`.
