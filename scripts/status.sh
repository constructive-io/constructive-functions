#!/usr/bin/env bash
#
# status.sh — Show the current state of the development environment.
#
# Usage:
#   make status
#   ./scripts/status.sh

set -uo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BOLD='\033[1m'
NC='\033[0m'

ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
warn() { echo -e "  ${YELLOW}●${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; }

echo ""
echo -e "${BOLD}═══ Environment Status ═══${NC}"
echo ""

# --- Docker containers ---
echo -e "${BOLD}Docker containers:${NC}"
if command -v docker &>/dev/null; then
  POSTGRES_UP=$(docker ps --filter "name=postgres" --filter "status=running" --format "{{.Names}}" 2>/dev/null | head -1)
  MINIO_UP=$(docker ps --filter "name=minio" --filter "status=running" --format "{{.Names}}" 2>/dev/null | head -1)

  if [ -n "$POSTGRES_UP" ]; then
    ok "PostgreSQL running ($POSTGRES_UP)"
  else
    fail "PostgreSQL not running"
  fi

  if [ -n "$MINIO_UP" ]; then
    ok "MinIO running ($MINIO_UP)"
  else
    warn "MinIO not running (optional)"
  fi

  MAILPIT_UP=$(docker ps --filter "name=mailpit" --filter "status=running" --format "{{.Names}}" 2>/dev/null | head -1)
  if [ -n "$MAILPIT_UP" ]; then
    ok "Mailpit running ($MAILPIT_UP) — SMTP :1025, UI http://localhost:8025"
  else
    warn "Mailpit not running (start with: make up:email-job)"
  fi
else
  fail "Docker not available"
fi

echo ""

# --- PostgreSQL connection ---
echo -e "${BOLD}PostgreSQL:${NC}"
if command -v psql &>/dev/null; then
  PG_VERSION=$(psql -t -A -c "SELECT version()" 2>/dev/null | head -1)
  if [ -n "$PG_VERSION" ]; then
    ok "Connected — ${PG_VERSION%%,*}"
  else
    fail "Cannot connect (check PGHOST/PGPORT/PGUSER or run: eval \"\$(pgpm env)\")"
  fi
else
  fail "psql not found"
fi

echo ""

# --- Databases ---
echo -e "${BOLD}Databases with constructive_compute_public:${NC}"
if command -v psql &>/dev/null; then
  DBS=$(psql -t -A -c "SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname" 2>/dev/null)
  FOUND=0
  for db in $DBS; do
    HAS_COMPUTE=$(psql -d "$db" -t -A -c "SELECT 1 FROM information_schema.schemata WHERE schema_name = 'constructive_compute_public'" 2>/dev/null)
    if [ "$HAS_COMPUTE" = "1" ]; then
      FN_COUNT=$(psql -d "$db" -t -A -c "SELECT count(*) FROM constructive_compute_public.platform_function_definitions WHERE is_invocable = true" 2>/dev/null || echo "?")
      JOBS_SCHEMA=$(psql -d "$db" -t -A -c "SELECT 1 FROM information_schema.schemata WHERE schema_name = 'app_jobs'" 2>/dev/null)
      JOBS_STATUS=""
      if [ "$JOBS_SCHEMA" = "1" ]; then
        JOBS_STATUS="jobs=yes"
      else
        JOBS_STATUS="jobs=no"
      fi
      ok "$db — ${FN_COUNT} invocable fn(s), ${JOBS_STATUS}"
      FOUND=1
    fi
  done
  if [ "$FOUND" = "0" ]; then
    warn "No databases with constructive_compute_public found"
    echo "    Run: make setup-platform"
  fi
fi

echo ""

# --- Node / pnpm ---
echo -e "${BOLD}Node.js:${NC}"
if command -v node &>/dev/null; then
  ok "node $(node --version)"
else
  fail "node not found"
fi
if command -v pnpm &>/dev/null; then
  ok "pnpm $(pnpm --version)"
else
  fail "pnpm not found"
fi
if command -v pgpm &>/dev/null; then
  ok "pgpm $(pgpm --version 2>/dev/null || echo '?')"
else
  fail "pgpm not found (npm install -g pgpm)"
fi

echo ""

# --- Build state ---
echo -e "${BOLD}Build:${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -d "$ROOT_DIR/job/compute-worker/dist" ]; then
  ok "compute-worker built"
else
  warn "compute-worker not built (run: pnpm build)"
fi
if [ -d "$ROOT_DIR/job/compute-service/dist" ]; then
  ok "compute-service built"
else
  warn "compute-service not built (run: pnpm build)"
fi
if [ -d "$ROOT_DIR/job/service/dist" ]; then
  ok "job-service built"
else
  warn "job-service not built (run: pnpm build)"
fi

echo ""
