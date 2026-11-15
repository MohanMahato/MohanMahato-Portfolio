# Supabase (database) folder

| Path | What it is |
|---|---|
| `migrations/` | The 6 SQL files that build the database. Keep these in GitHub. Run them in order (1 to 6). Safe to re-run. |
| `all_in_one.sql` | The 6 migrations joined into one file for a single paste. Regenerate with `npm run db:bundle`. |
| `manual/make_admin.sql` | Run ONCE in the SQL Editor to make your account the admin. |
| `tests/rls_verification.sql` | Security test. Works in the Supabase SQL Editor. Rolls back everything. |
| `tests/local_stub.sql`, `tests/run_local.sh` | Optional: run migrations + tests on a local PostgreSQL (`npm run db:test`). |

Guides: [`../docs/SUPABASE_SETUP.md`](../docs/SUPABASE_SETUP.md) (setup), [`../docs/DATABASE_ARCHITECTURE.md`](../docs/DATABASE_ARCHITECTURE.md) (design), [`../docs/TESTING_REPORT_PHASE3.md`](../docs/TESTING_REPORT_PHASE3.md) (test results)

Rules: never put the Secret / service_role key in the frontend, `.env`, or GitHub. Add new database
changes as NEW migration files (never edit old ones after you ran them).
