#!/usr/bin/env bash
#
# up.sh — Full procedural setup for the platform development environment.
#
# Steps:
#   1. Check prerequisites (docker, node, pnpm, pgpm)
#   2. Start PostgreSQL via pgpm docker
#   3. Bootstrap pgpm admin users
#   4. Create + deploy constructive-infra (DDL)
#   5. Deploy constructive-infra-seed (function + secret definitions)
#   6. Verify everything
#   7. Check .env coverage (if .env exists)
#
# Usage:
#   make up                       # defaults to constructive-functions-db1
#   make up DB_NAME=mydb          # custom database name
#   ./scripts/up.sh [db-name]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

DB_NAME="${1:-${DB_NAME:-constructive-functions-db1}}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BOLD='\033[1m'
NC='\033[0m'

step() { echo ""; echo -e "${BOLD}[$1/${TOTAL_STEPS}] $2${NC}"; }
ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
warn() { echo -e "  ${YELLOW}●${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; }

TOTAL_STEPS=7

echo ""
echo -e "${BOLD}════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  Platform Up — $DB_NAME${NC}"
echo -e "${BOLD}════════════════════════════════════════════════════════════${NC}"

# ─── Step 1: Prerequisites ───────────────────────────────────────────────────

step 1 "Checking prerequisites"

MISSING=0
for cmd in docker node pnpm pgpm psql; do
  if command -v "$cmd" &>/dev/null; then
    ok "$cmd found"
  else
    fail "$cmd not found"
    MISSING=1
  fi
done

if [ "$MISSING" = "1" ]; then
  echo ""
  fail "Missing prerequisites. Install them and re-run."
  exit 1
fi

# ─── Step 2: PostgreSQL ─────────────────────────────────────────────────────

step 2 "Starting PostgreSQL"

POSTGRES_UP=$(docker ps --filter "name=postgres" --filter "status=running" --format "{{.Names}}" 2>/dev/null | head -1)

if [ -n "$POSTGRES_UP" ]; then
  ok "Already running ($POSTGRES_UP)"
else
  echo "  Starting via pgpm docker..."
  pgpm docker start --image docker.io/constructiveio/postgres-plus:18
  ok "PostgreSQL started"
fi

# Load pgpm env for psql access
eval "$(pgpm env 2>/dev/null)" || true

# Wait for PG to be ready
echo "  Waiting for PostgreSQL to accept connections..."
for i in $(seq 1 30); do
  if psql -c "SELECT 1" &>/dev/null; then
    ok "PostgreSQL is ready"
    break
  fi
  if [ "$i" = "30" ]; then
    fail "PostgreSQL did not become ready in 30s"
    exit 1
  fi
  sleep 1
done

# ─── Step 3: Bootstrap ──────────────────────────────────────────────────────

step 3 "Bootstrapping pgpm admin users"

pgpm admin-users bootstrap --yes 2>/dev/null && ok "Roles bootstrapped" || ok "Roles already exist"

# ─── Step 4: Deploy constructive-infra ───────────────────────────────────────

step 4 "Deploying constructive-infra (DDL)"

createdb "$DB_NAME" 2>/dev/null && ok "Database '$DB_NAME' created" || ok "Database '$DB_NAME' already exists"

cd "$ROOT_DIR/pgpm"
pgpm deploy --yes --database "$DB_NAME" --package constructive-infra 2>&1 | grep -E "(SUCCESS: ✅|already)" || true
ok "constructive-infra deployed"

# ─── Step 5: Deploy constructive-infra-seed ──────────────────────────────────

step 5 "Deploying constructive-infra-seed (function + secret definitions)"

pgpm deploy --yes --database "$DB_NAME" --package constructive-infra-seed 2>&1 | grep -E "(SUCCESS: ✅|already)" || true
ok "constructive-infra-seed deployed"

cd "$ROOT_DIR"

# ─── Step 6: Verify ─────────────────────────────────────────────────────────

step 6 "Verifying platform"

"$SCRIPT_DIR/verify-platform.sh" "$DB_NAME"

# ─── Step 7: Check .env ─────────────────────────────────────────────────────

step 7 "Checking .env"

if [ -f "$ROOT_DIR/.env" ]; then
  "$SCRIPT_DIR/load-platform-env.sh" "$ROOT_DIR/.env" "$DB_NAME" || true
else
  warn "No .env file found. Create one from the example:"
  echo "    cp .env.example .env"
fi

# ─── Done ────────────────────────────────────────────────────────────────────

echo ""
echo -e "${BOLD}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  Platform is up. Database: $DB_NAME${NC}"
echo ""
echo -e "  ${BOLD}Next:${NC}"
echo "    make up:email-job    # start mailpit + compute-service"
echo "    make dev-compute     # start compute-service only"
echo "    make status          # show environment state"
echo -e "${BOLD}════════════════════════════════════════════════════════════${NC}"
echo ""
