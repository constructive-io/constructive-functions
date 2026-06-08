#!/usr/bin/env bash
#
# up.sh — Full procedural setup for the platform development environment.
#
# Steps:
#   1. Check prerequisites (docker, node, pnpm, pgpm)
#   2. Start PostgreSQL via pgpm docker
#   3. Bootstrap pgpm admin users
#   4. Create database + deploy all pgpm modules
#   5. Deploy constructive-infra-seed (function + secret definitions)
#   6. Start MinIO (object storage)
#   7. Verify everything
#   8. Check .env coverage (if .env exists)
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

TOTAL_STEPS=8

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

# ─── Step 4: Deploy all pgpm modules ────────────────────────────────────────

step 4 "Deploying pgpm modules"

createdb "$DB_NAME" 2>/dev/null && ok "Database '$DB_NAME' created" || ok "Database '$DB_NAME' already exists"

cd "$ROOT_DIR/pgpm"

# Deploy order matters: downstream modules depend on upstream ones.
#
#   constructive-infra     (standalone — namespaces, function defs, invocations)
#   constructive-store     (depends on infra — encrypted secrets, config, user state)
#   constructive-objects   (standalone — content-addressable merkle store)
#   constructive-fbp       (standalone — flow graphs, graph-specific merkle store)
#   constructive-storage   (standalone — file uploads, buckets, versioning)

MODULES=(
  constructive-infra
  constructive-store
  constructive-objects
  constructive-fbp
  constructive-storage
)

for mod in "${MODULES[@]}"; do
  if [ -d "$mod" ]; then
    pgpm deploy --yes --database "$DB_NAME" --package "$mod" 2>&1 | grep -E "(SUCCESS: ✅|already)" || true
    ok "$mod"
  else
    warn "$mod (not found, skipping)"
  fi
done

# ─── Step 5: Deploy constructive-infra-seed ──────────────────────────────────

step 5 "Deploying constructive-infra-seed (function + secret definitions)"

pgpm deploy --yes --database "$DB_NAME" --package constructive-infra-seed 2>&1 | grep -E "(SUCCESS: ✅|already)" || true
ok "constructive-infra-seed deployed"

cd "$ROOT_DIR"

# ─── Step 6: Start MinIO ────────────────────────────────────────────────────

step 6 "Starting MinIO (object storage)"

MINIO_UP=$(docker ps --filter "name=minio" --filter "status=running" --format "{{.Names}}" 2>/dev/null | head -1)

if [ -n "$MINIO_UP" ]; then
  ok "Already running ($MINIO_UP)"
else
  # Start MinIO via docker (detached)
  docker run -d \
    --name constructive-functions-minio \
    -p 9000:9000 \
    -p 9001:9001 \
    -e MINIO_ROOT_USER=minioadmin \
    -e MINIO_ROOT_PASSWORD=minioadmin \
    -v minio-data:/data \
    minio/minio:latest server /data --console-address ":9001" \
    2>/dev/null && ok "MinIO started" || ok "MinIO already exists"
fi

echo "  API:     http://localhost:9000"
echo "  Console: http://localhost:9001  (minioadmin/minioadmin)"

# ─── Step 7: Verify ─────────────────────────────────────────────────────────

step 7 "Verifying platform"

"$SCRIPT_DIR/verify-platform.sh" "$DB_NAME"

# ─── Step 8: Check .env ─────────────────────────────────────────────────────

step 8 "Checking .env"

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
echo -e "  ${BOLD}Modules:${NC}"
for mod in "${MODULES[@]}"; do
  if [ -d "$ROOT_DIR/pgpm/$mod" ]; then
    echo "    ✓ $mod"
  fi
done
echo ""
echo -e "  ${BOLD}Services:${NC}"
echo "    PostgreSQL    localhost:5432"
echo "    MinIO API     http://localhost:9000"
echo "    MinIO Console http://localhost:9001"
echo ""
echo -e "  ${BOLD}Next:${NC}"
echo "    make up:email-job    # start mailpit + compute-service"
echo "    make dev-compute     # start compute-service only"
echo "    make status          # show environment state"
echo -e "${BOLD}════════════════════════════════════════════════════════════${NC}"
echo ""
