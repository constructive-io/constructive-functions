#!/usr/bin/env bash
#
# up.sh — Full procedural setup for the platform development environment.
#
# Steps:
#   1. Check prerequisites (docker, node, pnpm, pgpm)
#   2. Start PostgreSQL via pgpm docker
#   3. Bootstrap pgpm admin users
#   4. Create database + deploy all pgpm modules
#   5. Deploy platform-seed (database row, schemas, API routing)
#   6. Deploy constructive-infra-seed + services registration
#   7. Start MinIO (object storage)
#   8. Verify everything
#   9. Check .env coverage (if .env exists)
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

TOTAL_STEPS=9

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
#   constructive-users     (standalone — users, role_types stubs)
#   constructive-infra     (standalone — namespaces, namespace_events)
#   constructive-objects   (standalone — content-addressable merkle store)
#   constructive-storage   (standalone — file uploads, buckets)
#   constructive-store     (standalone — encrypted secrets, config, user state)
#   constructive-compute   (depends on services, users, infra — function defs, invocations, execution logs)
#   constructive-platform-function-graph (standalone — function graph merkle store, unprefixed functions)
#
# @pgpm/services is installed as an extension dependency (extensions/@pgpm/services)
# and auto-deployed when constructive-compute requires it.

MODULES=(
  constructive-users
  constructive-infra
  constructive-objects
  constructive-storage
  constructive-store
  constructive-compute
  constructive-platform-function-graph
)

DEPLOY_LOG="$ROOT_DIR/.deploy-log"

for mod in "${MODULES[@]}"; do
  if [ -d "$mod" ]; then
    DEPLOY_RC=0
    pgpm deploy --yes --database "$DB_NAME" --package "$mod" > "$DEPLOY_LOG" 2>&1 || DEPLOY_RC=$?
    if [ $DEPLOY_RC -eq 0 ] && grep -q "Deployment complete" "$DEPLOY_LOG"; then
      ok "$mod"
    elif grep -q "already" "$DEPLOY_LOG" && [ $DEPLOY_RC -eq 0 ]; then
      ok "$mod (already deployed)"
    else
      fail "$mod — deploy output:"
      sed 's/^/    /' "$DEPLOY_LOG"
    fi
  else
    warn "$mod (not found, skipping)"
  fi
done

rm -f "$DEPLOY_LOG"

# ─── Step 5: Deploy platform seed (metaschema routing) ────────────────────────

step 5 "Deploying platform seed (database, schemas, API routing)"

DEPLOY_LOG="$ROOT_DIR/.deploy-log"

PLAT_RC=0
pgpm deploy --yes --database "$DB_NAME" --package constructive-platform-seed > "$DEPLOY_LOG" 2>&1 || PLAT_RC=$?
if [ $PLAT_RC -eq 0 ]; then
  ok "constructive-platform-seed deployed"
else
  fail "constructive-platform-seed — deploy output:"
  sed 's/^/    /' "$DEPLOY_LOG"
fi

rm -f "$DEPLOY_LOG"

# ─── Step 6: Deploy seed data + service registration ─────────────────────────

step 6 "Deploying seed data + MetaSchema registration"

DEPLOY_LOG="$ROOT_DIR/.deploy-log"

SEED_RC=0
pgpm deploy --yes --database "$DB_NAME" --package constructive-infra-seed > "$DEPLOY_LOG" 2>&1 || SEED_RC=$?
if [ $SEED_RC -eq 0 ]; then
  ok "constructive-infra-seed deployed"
else
  fail "constructive-infra-seed — deploy output:"
  sed 's/^/    /' "$DEPLOY_LOG"
fi

SVC_RC=0
pgpm deploy --yes --database "$DB_NAME" --package constructive-infra-services > "$DEPLOY_LOG" 2>&1 || SVC_RC=$?
if [ $SVC_RC -eq 0 ]; then
  ok "constructive-infra-services deployed"
else
  fail "constructive-infra-services — deploy output:"
  sed 's/^/    /' "$DEPLOY_LOG"
fi

rm -f "$DEPLOY_LOG"

cd "$ROOT_DIR"

# ─── Step 7: Start MinIO ────────────────────────────────────────────────────

step 7 "Starting MinIO (object storage)"

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

# ─── Step 8: Verify ─────────────────────────────────────────────────────────

step 8 "Verifying platform"

"$SCRIPT_DIR/verify-platform.sh" "$DB_NAME"

# ─── Step 9: Check .env ─────────────────────────────────────────────────────

step 9 "Loading .env into platform"

if [ -f "$ROOT_DIR/.env" ]; then
  "$SCRIPT_DIR/load-platform-env.sh" "$ROOT_DIR/.env" "$DB_NAME" || true
else
  warn "No .env file found — secrets/configs not loaded."
  echo "    cp .env.example .env"
  echo "    # Then re-run: make up"
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
