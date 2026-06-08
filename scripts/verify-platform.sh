#!/usr/bin/env bash
#
# verify-platform.sh — Verify the platform DB is correctly set up.
#
# Checks that constructive-infra is deployed, app_jobs schema exists,
# and function definitions are seeded. Exits non-zero if anything is wrong.
#
# Usage:
#   make verify-platform                          # uses default DB
#   make verify-platform DB_NAME=my-db            # custom DB
#   ./scripts/verify-platform.sh [db-name]

set -uo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
BOLD='\033[1m'
NC='\033[0m'

DB_NAME="${1:-${DB_NAME:-constructive-functions-db1}}"
ERRORS=0

ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; ERRORS=$((ERRORS + 1)); }

echo ""
echo -e "${BOLD}═══ Verify Platform: $DB_NAME ═══${NC}"
echo ""

# --- Database exists ---
if psql -d "$DB_NAME" -c "SELECT 1" &>/dev/null; then
  ok "Database '$DB_NAME' exists and is reachable"
else
  fail "Database '$DB_NAME' does not exist or is not reachable"
  echo ""
  echo "  Fix: make setup-platform DB_NAME=$DB_NAME"
  echo "  (or: pgpm docker start --image docker.io/constructiveio/postgres-plus:18)"
  exit 1
fi

# --- constructive_infra_public schema ---
HAS_INFRA=$(psql -d "$DB_NAME" -t -A -c "SELECT 1 FROM information_schema.schemata WHERE schema_name = 'constructive_infra_public'" 2>/dev/null)
if [ "$HAS_INFRA" = "1" ]; then
  ok "Schema constructive_infra_public exists"
else
  fail "Schema constructive_infra_public missing"
  echo "    Fix: cd pgpm/constructive-infra && pgpm install && cd .. && pgpm deploy --yes --database $DB_NAME --package constructive-infra"
fi

# --- app_jobs schema ---
HAS_JOBS=$(psql -d "$DB_NAME" -t -A -c "SELECT 1 FROM information_schema.schemata WHERE schema_name = 'app_jobs'" 2>/dev/null)
if [ "$HAS_JOBS" = "1" ]; then
  ok "Schema app_jobs exists"
else
  fail "Schema app_jobs missing (should be deployed as dependency of constructive-infra)"
fi

# --- platform_function_definitions table ---
HAS_TABLE=$(psql -d "$DB_NAME" -t -A -c "SELECT 1 FROM information_schema.tables WHERE table_schema = 'constructive_infra_public' AND table_name = 'platform_function_definitions'" 2>/dev/null)
if [ "$HAS_TABLE" = "1" ]; then
  ok "Table platform_function_definitions exists"
else
  fail "Table platform_function_definitions missing"
fi

# --- platform_function_invocations table ---
HAS_INV=$(psql -d "$DB_NAME" -t -A -c "SELECT 1 FROM information_schema.tables WHERE table_schema = 'constructive_infra_public' AND table_name = 'platform_function_invocations'" 2>/dev/null)
if [ "$HAS_INV" = "1" ]; then
  ok "Table platform_function_invocations exists"
else
  fail "Table platform_function_invocations missing"
fi

# --- Seeded functions ---
if [ "$HAS_TABLE" = "1" ]; then
  FN_COUNT=$(psql -d "$DB_NAME" -t -A -c "SELECT count(*) FROM constructive_infra_public.platform_function_definitions WHERE is_invocable = true" 2>/dev/null)
  if [ "$FN_COUNT" -gt 0 ] 2>/dev/null; then
    ok "$FN_COUNT invocable function(s) registered:"
    psql -d "$DB_NAME" -t -A -c "SELECT '    ' || name || ' → ' || COALESCE(service_url, '(no url)') FROM constructive_infra_public.platform_function_definitions WHERE is_invocable = true ORDER BY name" 2>/dev/null
  else
    fail "No invocable functions seeded"
    echo "    Fix: psql -d $DB_NAME -f scripts/seed-functions.sql"
  fi
fi

# --- jobs table ---
if [ "$HAS_JOBS" = "1" ]; then
  JOB_COUNT=$(psql -d "$DB_NAME" -t -A -c "SELECT count(*) FROM app_jobs.jobs" 2>/dev/null)
  ok "$JOB_COUNT pending job(s) in queue"
fi

echo ""
if [ "$ERRORS" -gt 0 ]; then
  echo -e "${RED}${BOLD}$ERRORS issue(s) found.${NC} See fixes above."
  exit 1
else
  echo -e "${GREEN}${BOLD}All checks passed.${NC} Platform is ready."
  echo "  Next: make dev-compute"
fi
echo ""
