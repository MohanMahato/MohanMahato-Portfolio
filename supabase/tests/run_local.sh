#!/usr/bin/env bash
# Runs ALL migrations + security tests on a throwaway LOCAL PostgreSQL database.
# Needs: PostgreSQL 15+ and the "psql" command.
# Usage:  DB_URL=postgresql://postgres:postgres@localhost:5432/postgres bash supabase/tests/run_local.sh
set -euo pipefail
cd "$(dirname "$0")/.."

BASE_URL="${DB_URL:-postgresql://postgres:postgres@localhost:5432/postgres}"
TEST_DB="portfolio_migration_test"
ROOT_URL="${BASE_URL%/*}"
URL="$ROOT_URL/$TEST_DB"
PSQL="psql -v ON_ERROR_STOP=1 -q"

echo "== Creating fresh test database"
$PSQL "$BASE_URL" -c "drop database if exists $TEST_DB" -c "create database $TEST_DB" >/dev/null

echo "== Applying Supabase stub (local only)"
$PSQL "$URL" -f tests/local_stub.sql >/dev/null

echo "== Applying migrations (first run)"
for f in migrations/*.sql; do echo "   $f"; $PSQL "$URL" -f "$f" >/dev/null; done

echo "== Applying migrations AGAIN (must be safe to re-run)"
for f in migrations/*.sql; do $PSQL "$URL" -f "$f" >/dev/null; done
echo "   OK"

echo "== Security tests WITHOUT an admin (admin part should be skipped)"
$PSQL "$URL" -f tests/rls_verification.sql 2>&1 | grep -E "PASS|FAIL|SKIPPED|ERROR" || true

echo "== Creating a fake admin user, then running the FULL security tests"
$PSQL "$URL" -c "insert into auth.users (id, email) values ('11111111-1111-1111-1111-111111111111', 'admin@test.local')" \
             -c "insert into public.admin_users (user_id) values ('11111111-1111-1111-1111-111111111111')"
$PSQL "$URL" -f tests/rls_verification.sql 2>&1 | tee /tmp/rls_full.log | grep -E "PASS|FAIL|SKIPPED|ERROR"

PASS=$(grep -c "PASS" /tmp/rls_full.log || true)
if grep -qE "FAIL|ERROR|SKIPPED" /tmp/rls_full.log; then echo "RESULT: FAILED ($PASS passed)"; exit 1; fi
echo "RESULT: ALL $PASS CHECKS PASSED"
