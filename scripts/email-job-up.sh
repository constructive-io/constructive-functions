#!/usr/bin/env bash
#
# email-job-up.sh — Start mailpit + compute-service for local email testing.
#
# Requires the platform to be up first (make up).
# Starts mailpit (SMTP on :1025, web UI on :8025) then launches
# the compute-service + functions with SMTP mode enabled.
#
# Usage:
#   make up:email-job                    # default DB
#   make up:email-job DB_NAME=db8        # custom DB

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

TOTAL_STEPS=5

echo ""
echo -e "${BOLD}════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  Email Job Up — $DB_NAME${NC}"
echo -e "${BOLD}════════════════════════════════════════════════════════════${NC}"

# ─── Step 1: Verify platform is up ──────────────────────────────────────────

step 1 "Checking platform"

eval "$(pgpm env 2>/dev/null)" || true

if ! psql -d "$DB_NAME" -c "SELECT 1" &>/dev/null; then
  fail "Database '$DB_NAME' is not reachable. Run 'make up' first."
  exit 1
fi

HAS_COMPUTE=$(psql -d "$DB_NAME" -t -A -c "SELECT 1 FROM information_schema.schemata WHERE schema_name = 'constructive_compute_public'" 2>/dev/null)
if [ "$HAS_COMPUTE" != "1" ]; then
  fail "constructive-compute not deployed to '$DB_NAME'. Run 'make up' first."
  exit 1
fi

ok "Platform is up ($DB_NAME)"

# ─── Step 2: Start mailpit ──────────────────────────────────────────────────

step 2 "Starting mailpit"

MAILPIT_UP=$(docker ps --filter "name=mailpit" --filter "status=running" --format "{{.Names}}" 2>/dev/null | head -1)

if [ -n "$MAILPIT_UP" ]; then
  ok "Already running ($MAILPIT_UP)"
else
  cd "$ROOT_DIR"
  # Need POSTGRES_PASSWORD for docker-compose even if we only start mailpit
  export POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-password}"
  docker compose up -d mailpit 2>&1 | tail -3
  ok "Mailpit started"
fi

echo "  SMTP:   localhost:1025"
echo "  Web UI: http://localhost:8025"

# ─── Step 3: Build packages ─────────────────────────────────────────────────

step 3 "Checking build"

cd "$ROOT_DIR"
if [ ! -f "generated/functions-manifest.json" ]; then
  echo "  Generating function packages..."
  node --experimental-strip-types scripts/generate.ts
  pnpm install 2>/dev/null || true
fi
if [ ! -d "job/compute-service/dist" ] || [ ! -d "job/compute-worker/dist" ]; then
  echo "  Building packages..."
  pnpm build 2>&1 | tail -5
  ok "Built"
else
  ok "Already built"
fi

# ─── Step 4: Load .env ──────────────────────────────────────────────────────

step 4 "Loading environment"

# Default SMTP/Mailpit env — user's .env overrides these
export EMAIL_SEND_USE_SMTP="${EMAIL_SEND_USE_SMTP:-true}"
export SMTP_HOST="${SMTP_HOST:-localhost}"
export SMTP_PORT="${SMTP_PORT:-1025}"
export SMTP_FROM="${SMTP_FROM:-test@localhost}"
export SEND_EMAIL_DRY_RUN="${SEND_EMAIL_DRY_RUN:-false}"
export SEND_VERIFICATION_LINK_DRY_RUN="${SEND_VERIFICATION_LINK_DRY_RUN:-false}"

if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  source "$ROOT_DIR/.env"
  set +a
  ok "Loaded .env"
else
  warn "No .env file — using defaults (SMTP mode, Mailpit on localhost:1025)"
fi

ok "EMAIL_SEND_USE_SMTP=$EMAIL_SEND_USE_SMTP"
ok "SMTP_HOST=$SMTP_HOST:$SMTP_PORT"
ok "SEND_EMAIL_DRY_RUN=$SEND_EMAIL_DRY_RUN"

# ─── Step 4b: Check function secret/config coverage ──────────────────────────

echo ""
echo -e "  ${BOLD}Checking secret/config coverage:${NC}"

# Build a newline-separated list of loaded env var names (bash 3 compatible)
LOADED_VARS=""
for var in EMAIL_SEND_USE_SMTP SMTP_HOST SMTP_PORT SMTP_FROM SEND_EMAIL_DRY_RUN \
           SEND_VERIFICATION_LINK_DRY_RUN MAILGUN_API_KEY MAILGUN_DOMAIN \
           MAILGUN_FROM MAILGUN_REPLY MAILGUN_KEY LOCAL_APP_PORT; do
  eval "val=\${$var+x}"
  [ -n "$val" ] && LOADED_VARS="$LOADED_VARS
$var"
done
if [ -f "$ROOT_DIR/.env" ]; then
  while IFS= read -r line; do
    case "$line" in \#*|"") continue ;; esac
    key="${line%%=*}"
    case "$key" in
      [A-Za-z_]*) LOADED_VARS="$LOADED_VARS
$key" ;;
    esac
  done < "$ROOT_DIR/.env"
fi

has_var() {
  echo "$LOADED_VARS" | grep -qx "$1"
}

# Query function requirements from DB
FN_REQS=$(psql -d "$DB_NAME" -t -A -F '|' -c "
  SELECT
    name,
    COALESCE(array_to_string(
      ARRAY(SELECT (r).name FROM unnest(required_secrets) AS r), ','
    ), '') AS secrets,
    COALESCE(array_to_string(
      ARRAY(SELECT (r).name FROM unnest(required_configs) AS r), ','
    ), '') AS configs
  FROM constructive_compute_public.platform_function_definitions
  WHERE is_invocable = true
  ORDER BY name
" 2>/dev/null) || true

TOTAL_MISSING=0
if [ -n "$FN_REQS" ]; then
  while IFS='|' read -r fn_name secrets configs; do
    ALL_KEYS=""
    [ -n "$secrets" ] && ALL_KEYS="$secrets"
    [ -n "$configs" ] && { [ -n "$ALL_KEYS" ] && ALL_KEYS="$ALL_KEYS,$configs" || ALL_KEYS="$configs"; }

    FN_SET=0
    FN_MISS=0
    FN_TOTAL=0
    OLD_IFS="$IFS"; IFS=','
    for key in $ALL_KEYS; do
      IFS="$OLD_IFS"
      [ -z "$key" ] && continue
      FN_TOTAL=$((FN_TOTAL + 1))
      if has_var "$key"; then
        FN_SET=$((FN_SET + 1))
      else
        FN_MISS=$((FN_MISS + 1))
        TOTAL_MISSING=$((TOTAL_MISSING + 1))
      fi
    done
    IFS="$OLD_IFS"
    if [ "$FN_MISS" -gt 0 ]; then
      warn "$fn_name: $FN_SET/$FN_TOTAL secrets/configs set ($FN_MISS missing)"
    else
      ok "$fn_name: all $FN_SET secrets/configs set"
    fi
  done <<< "$FN_REQS"
fi

if [ "$TOTAL_MISSING" -gt 0 ]; then
  warn "$TOTAL_MISSING secret(s)/config(s) missing — functions may use defaults"
  echo "  Run 'make check-env' for details"
fi

# ─── Step 5: Start compute-service ──────────────────────────────────────────

step 5 "Starting compute-service + functions"

echo ""
echo -e "${BOLD}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  Email Job is up${NC}"
echo ""
echo "  Mailpit UI: http://localhost:8025"
echo "  Database:   $DB_NAME"
echo ""
echo "  Test: psql -d $DB_NAME -c \\"
echo "    \"INSERT INTO app_jobs.jobs (task_identifier, payload)"
echo "     VALUES ('send-email',"
echo "     '{\\\"to\\\":\\\"test@example.com\\\",\\\"subject\\\":\\\"Hello\\\",\\\"html\\\":\\\"<p>Test from compute-worker</p>\\\"}');\""
echo ""
echo "  Ctrl+C to stop compute-service (mailpit keeps running)"
echo -e "${BOLD}════════════════════════════════════════════════════════════${NC}"
echo ""

export PGDATABASE="$DB_NAME"
exec node --experimental-strip-types "$ROOT_DIR/scripts/dev-compute.ts"
