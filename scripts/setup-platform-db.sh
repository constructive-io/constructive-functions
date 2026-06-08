#!/usr/bin/env bash
#
# setup-platform-db.sh — deploy constructive-infra (includes built-in function seeds)
#
# Works with both Tier 1 (pgpm-local) and Tier 2 (compose-local).
# Creates the database, bootstraps pgpm roles, and deploys the infra schema.
# Built-in function definitions (send-email, send-verification-link) are seeded
# as a pgpm fixture — no separate SQL step needed.
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

# --- Deploy constructive-infra ---
# This deploys all schemas (constructive_infra_public, app_jobs, etc.),
# tables, triggers, and seeds built-in function definitions as a fixture.
echo "→ Deploying constructive-infra package..."
cd "$ROOT_DIR/pgpm"
pgpm deploy --yes --database "$DB_NAME" --package constructive-infra

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
