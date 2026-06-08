#!/usr/bin/env bash
set -euo pipefail

DB_NAME="${1:-constructive-functions-db1}"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "  Platform UI — $DB_NAME"
echo "════════════════════════════════════════════════════════════"
echo ""

# ── 1. Check platform ────────────────────────────────────────────────────────

echo "[1/3] Checking platform"
eval "$(pgpm env 2>/dev/null || true)"
export PGDATABASE="$DB_NAME"

if psql -d "$DB_NAME" -c "SELECT 1" &>/dev/null; then
  echo "  ✓ Platform is up ($DB_NAME)"
else
  echo "  ✗ Cannot connect to database '$DB_NAME'"
  echo "    Run: make up DB_NAME=$DB_NAME"
  exit 1
fi

# ── 2. Install deps if needed ────────────────────────────────────────────────

echo ""
echo "[2/3] Checking dependencies"
if [ ! -d "www/node_modules" ]; then
  echo "  Installing www/ dependencies..."
  pnpm install --filter @constructive-io/platform-ui
  echo "  ✓ Dependencies installed"
else
  echo "  ✓ Dependencies present"
fi

# ── 3. Start ─────────────────────────────────────────────────────────────────

echo ""
echo "[3/3] Starting Platform UI"
echo ""
echo "════════════════════════════════════════════════════════════"
echo "  Services:"
echo "    Vite (frontend)                    http://localhost:5173"
echo "    Express (API + WebSocket)          http://localhost:3456"
echo "    Terminal WebSocket                 ws://localhost:3456/ws/terminal"
echo ""
echo "  API Endpoints:"
echo "    GET  /api/status                   Platform status"
echo "    GET  /api/functions                Function definitions"
echo "    GET  /api/secrets                  Secret definitions"
echo "    GET  /api/jobs                     Recent jobs"
echo "    POST /api/jobs                     Create a job"
echo "    GET  /api/invocations              Function invocations"
echo "    POST /api/run                      Execute make commands"
echo ""
echo "  Database: $DB_NAME"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "  Ctrl+C to stop"
echo ""

export PROJECT_ROOT="$(pwd)"
cd www && pnpm dev
