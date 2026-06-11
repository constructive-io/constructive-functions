#!/usr/bin/env bash
#
# start-graphql-server.sh — Start the Constructive GraphQL server as a background process.
#
# Uses @constructive-io/graphql-server from the sibling constructive repo.
# Resolves the API routing chain seeded by constructive-platform-seed.
#
# Usage:
#   ./scripts/start-graphql-server.sh [db-name] [port]
#
# Environment:
#   CONSTRUCTIVE_REPO  Path to constructive monorepo (default: ../constructive)
#   GRAPHQL_PORT       Server port (default: 6464)
#   PGHOST, PGPORT, PGUSER, PGPASSWORD — from pgpm env
#
# The server PID is written to .graphql-server.pid for clean shutdown.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

DB_NAME="${1:-${DB_NAME:-constructive-functions-db1}}"
GRAPHQL_PORT="${2:-${GRAPHQL_PORT:-6464}}"

# Resolve constructive repo path
CONSTRUCTIVE_REPO="${CONSTRUCTIVE_REPO:-$(cd "$ROOT_DIR/../constructive" 2>/dev/null && pwd || echo "")}"

if [ -z "$CONSTRUCTIVE_REPO" ] || [ ! -f "$CONSTRUCTIVE_REPO/graphql/server/dist/index.js" ]; then
  echo "  Cannot find constructive repo with built graphql-server."
  echo "  Set CONSTRUCTIVE_REPO or ensure ../constructive is built."
  echo "  Skipping GraphQL server."
  exit 1
fi

PID_FILE="$ROOT_DIR/.graphql-server.pid"
LOG_FILE="$ROOT_DIR/.graphql-server.log"

# Kill existing server if running
if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if kill -0 "$OLD_PID" 2>/dev/null; then
    kill "$OLD_PID" 2>/dev/null || true
    sleep 1
  fi
  rm -f "$PID_FILE"
fi

# Check if port is already in use
if fuser "$GRAPHQL_PORT/tcp" 2>/dev/null | grep -q .; then
  echo "  Port $GRAPHQL_PORT is already in use."
  exit 1
fi

# Load pgpm env for PG connection
eval "$(pgpm env 2>/dev/null)" || true

# Start the server as a background process
GRAPHILE_ENV=development \
PGDATABASE="$DB_NAME" \
PGHOST="${PGHOST:-localhost}" \
PGPORT="${PGPORT:-5432}" \
PGUSER="${PGUSER:-postgres}" \
PGPASSWORD="${PGPASSWORD:-password}" \
node -e "
const { GraphQLServer } = require('$CONSTRUCTIVE_REPO/graphql/server/dist/index.js');
GraphQLServer({
  pg: {
    database: '$DB_NAME',
    host: process.env.PGHOST,
    port: parseInt(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD
  },
  server: { port: $GRAPHQL_PORT, host: '0.0.0.0', origin: '*' },
  api: { enableServicesApi: true, isPublic: true },
  features: { simpleInflection: true, oppositeBaseNames: false, postgis: true }
});
" > "$LOG_FILE" 2>&1 &

SERVER_PID=$!
echo "$SERVER_PID" > "$PID_FILE"

# Wait briefly for server to start
for i in $(seq 1 10); do
  if curl -sf http://localhost:"$GRAPHQL_PORT"/healthz >/dev/null 2>&1; then
    echo "$SERVER_PID"
    exit 0
  fi
  # Check if the process died
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "  Server process exited unexpectedly. Check $LOG_FILE"
    rm -f "$PID_FILE"
    exit 1
  fi
  sleep 1
done

echo "  Server did not respond within 10s. Check $LOG_FILE"
echo "$SERVER_PID"
exit 0
