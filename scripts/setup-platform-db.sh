#!/usr/bin/env bash
#
# setup-platform-db.sh — deploy constructive-infra + constructive-infra-seed
#
# Works with both Tier 1 (pgpm-local) and Tier 2 (compose-local).
# Creates the database, bootstraps pgpm roles, deploys the infra schema,
# then deploys the seed package (built-in function definitions).
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

# --- Deploy constructive-infra (DDL: schemas, tables, triggers) ---
echo "→ Deploying constructive-infra..."
cd "$ROOT_DIR/pgpm"
pgpm deploy --yes --database "$DB_NAME" --package constructive-infra

# --- Deploy constructive-infra-seed (built-in function definitions) ---
echo "→ Deploying constructive-infra-seed..."
pgpm deploy --yes --database "$DB_NAME" --package constructive-infra-seed

# --- Verify ---
echo ""
echo "→ Verifying..."
FUNCTION_COUNT=$(psql -d "$DB_NAME" -t -A -c \
  "SELECT count(*) FROM constructive_infra_public.platform_function_definitions WHERE is_invocable = true")
echo "  $FUNCTION_COUNT invocable function(s) registered."

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  Done. Database '$DB_NAME' is ready."
echo ""
echo "  Next: make dev-compute"
echo "════════════════════════════════════════════════════════════"
