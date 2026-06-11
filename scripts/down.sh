#!/usr/bin/env bash
#
# down.sh — Tear down the platform development environment.
#
# Stops PostgreSQL (pgpm docker stop), optionally drops the database.
#
# Usage:
#   make down                     # stop postgres
#   make down DB_NAME=mydb        # stop postgres + drop mydb
#   DROP=1 make down DB_NAME=mydb # explicit drop

set -euo pipefail

DB_NAME="${1:-${DB_NAME:-}}"
DROP="${DROP:-}"

RED='\033[0;31m'
GREEN='\033[0;32m'
BOLD='\033[1m'
NC='\033[0m'

ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; }

echo ""
echo -e "${BOLD}════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  Platform Down${NC}"
echo -e "${BOLD}════════════════════════════════════════════════════════════${NC}"
echo ""

# --- Stop any running docker-compose services (mailpit, etc.) ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -f "$ROOT_DIR/docker-compose.yml" ]; then
  echo "Stopping docker-compose services..."
  cd "$ROOT_DIR"
  docker compose down 2>/dev/null && ok "Docker Compose services stopped" || ok "No compose services running"
fi

# --- Drop database if requested ---
if [ -n "$DB_NAME" ] && [ -n "$DROP" ]; then
  eval "$(pgpm env 2>/dev/null)" || true
  echo "Dropping database '$DB_NAME'..."
  dropdb "$DB_NAME" 2>/dev/null && ok "Database '$DB_NAME' dropped" || ok "Database '$DB_NAME' does not exist"
fi

# --- Stop GraphQL server ---
if [ -f "$ROOT_DIR/.graphql-server.pid" ]; then
  echo "Stopping GraphQL server..."
  GQL_PID=$(cat "$ROOT_DIR/.graphql-server.pid")
  if kill "$GQL_PID" 2>/dev/null; then
    sleep 1
    # Force kill if still alive
    kill -9 "$GQL_PID" 2>/dev/null || true
    ok "GraphQL server stopped (PID $GQL_PID)"
  else
    ok "GraphQL server was not running"
  fi
  rm -f "$ROOT_DIR/.graphql-server.pid"
fi

# --- Stop MinIO ---
echo "Stopping MinIO..."
docker stop constructive-functions-minio 2>/dev/null && docker rm constructive-functions-minio 2>/dev/null && ok "MinIO stopped" || ok "MinIO was not running"

# --- Stop PostgreSQL ---
echo "Stopping PostgreSQL..."
pgpm docker stop 2>/dev/null && ok "PostgreSQL stopped" || ok "PostgreSQL was not running"

echo ""
echo -e "${GREEN}${BOLD}  Platform is down.${NC}"
echo ""
