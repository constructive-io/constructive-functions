#!/usr/bin/env bash
#
# email-job-down.sh — Stop mailpit and any running compute-service processes.
#
# Usage:
#   make down:email-job

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

GREEN='\033[0;32m'
BOLD='\033[1m'
NC='\033[0m'

ok() { echo -e "  ${GREEN}✓${NC} $1"; }

echo ""
echo -e "${BOLD}════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  Email Job Down${NC}"
echo -e "${BOLD}════════════════════════════════════════════════════════════${NC}"
echo ""

# Stop mailpit via docker compose
cd "$ROOT_DIR"
export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-password}"
docker compose stop mailpit 2>/dev/null && ok "Mailpit stopped" || ok "Mailpit was not running"

# Kill any running compute-service / dev-compute processes
pkill -f "dev-compute.ts" 2>/dev/null && ok "Compute-service stopped" || ok "Compute-service was not running"
pkill -f "compute-service/dist/run.js" 2>/dev/null || true

echo ""
echo -e "${GREEN}${BOLD}  Email Job is down.${NC}"
echo "  PostgreSQL is still running. Use 'make down' to stop everything."
echo ""
