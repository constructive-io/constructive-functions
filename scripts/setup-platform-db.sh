#!/usr/bin/env bash
#
# setup-platform-db.sh — deploy constructive-infra and seed function definitions
#
# Works with both Tier 1 (pgpm-local) and Tier 2 (compose-local).
# Creates the database, bootstraps pgpm roles, deploys the infra schema,
# and seeds platform_function_definitions with known functions.
#
# Usage:
#   ./scripts/setup-platform-db.sh                       # defaults to constructive-functions-db1
#   ./scripts/setup-platform-db.sh my-custom-db-name     # custom database name
#   DB_NAME=my-db ./scripts/setup-platform-db.sh         # via env var

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

DB_NAME="${1:-${DB_NAME:-constructive-functions-db1}}"

echo "════════════════════════════════════════════════════════════"
echo "  Platform DB Setup: $DB_NAME"
echo "════════════════════════════════════════════════════════════"
echo ""

# --- Create database ---
echo "→ Creating database '$DB_NAME'..."
createdb "$DB_NAME" 2>/dev/null && echo "  Created." || echo "  Already exists."

# --- Bootstrap pgpm admin users ---
echo "→ Bootstrapping pgpm admin users..."
pgpm admin-users bootstrap --yes 2>/dev/null || true

# --- Install pgpm module dependencies ---
echo "→ Installing pgpm dependencies..."
cd "$ROOT_DIR/pgpm/constructive-infra"
pgpm install

# --- Deploy constructive-infra ---
echo "→ Deploying constructive-infra package..."
cd "$ROOT_DIR/pgpm"
pgpm deploy --yes --database "$DB_NAME" --package constructive-infra

# Note: @pgpm/database-jobs (app_jobs schema) deploys automatically
# as a dependency of constructive-infra — no separate step needed.

# --- Seed function definitions ---
echo "→ Seeding function definitions..."
psql -d "$DB_NAME" -f "$ROOT_DIR/scripts/seed-functions.sql"

# --- Verify ---
echo ""
echo "→ Verifying seed data..."
FUNCTION_COUNT=$(psql -d "$DB_NAME" -t -A -c \
  "SELECT count(*) FROM constructive_infra_public.platform_function_definitions WHERE is_invocable = true")
echo "  $FUNCTION_COUNT invocable function(s) registered."

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  Done. Database '$DB_NAME' is ready."
echo ""
echo "  Next: make dev-compute"
echo "════════════════════════════════════════════════════════════"
