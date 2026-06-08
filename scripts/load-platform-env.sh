#!/usr/bin/env bash
#
# load-platform-env.sh — load .env and check platform secret/config coverage
#
# Reads your .env file, cross-references it against the required_secrets and
# required_configs declared in platform_function_definitions, and reports
# which are satisfied vs missing.
#
# Usage:
#   ./scripts/load-platform-env.sh                       # defaults to .env + constructive-functions-db1
#   ./scripts/load-platform-env.sh .env.local db8        # custom env file + database
#   DB_NAME=db8 ./scripts/load-platform-env.sh           # via env var

set -euo pipefail

ENV_FILE="${1:-.env}"
DB_NAME="${2:-${DB_NAME:-constructive-functions-db1}}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found."
  echo ""
  echo "Create one from the example:"
  echo "  cp .env.example $ENV_FILE"
  echo ""
  echo "Required keys for email functions (SMTP/Mailpit):"
  echo "  POSTGRES_PASSWORD=password"
  echo "  EMAIL_SEND_USE_SMTP=true"
  echo "  SMTP_HOST=localhost"
  echo "  SMTP_PORT=1025"
  echo "  SMTP_FROM=test@localhost"
  echo "  SEND_EMAIL_DRY_RUN=false"
  echo "  SEND_VERIFICATION_LINK_DRY_RUN=false"
  exit 1
fi

echo "════════════════════════════════════════════════════════════"
echo "  Platform Environment Check"
echo "  .env: $ENV_FILE    database: $DB_NAME"
echo "════════════════════════════════════════════════════════════"
echo ""

# Load env file into associative array (bash 4+)
declare -A ENV_VARS
while IFS= read -r line; do
  # Skip comments and blank lines
  [[ "$line" =~ ^[[:space:]]*# ]] && continue
  [[ -z "$line" ]] && continue
  # Parse KEY=VALUE (strip quotes)
  if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*) ]]; then
    key="${BASH_REMATCH[1]}"
    val="${BASH_REMATCH[2]}"
    # Strip surrounding quotes
    val="${val#\"}"
    val="${val%\"}"
    val="${val#\'}"
    val="${val%\'}"
    ENV_VARS["$key"]="$val"
  fi
done < "$ENV_FILE"

echo "Loaded ${#ENV_VARS[@]} variable(s) from $ENV_FILE"
echo ""

# Query functions and their requirements
FUNCTIONS=$(psql -d "$DB_NAME" -t -A -F '|' -c "
  SELECT
    name,
    COALESCE(array_to_string(
      ARRAY(SELECT (r).name FROM unnest(required_secrets) AS r), ','
    ), '') AS secrets,
    COALESCE(array_to_string(
      ARRAY(SELECT (r).name FROM unnest(required_configs) AS r), ','
    ), '') AS configs,
    COALESCE(array_to_string(
      ARRAY(SELECT (r).name FROM unnest(required_secrets) AS r WHERE (r).required = true), ','
    ), '') AS required_secrets,
    COALESCE(array_to_string(
      ARRAY(SELECT (r).name FROM unnest(required_configs) AS r WHERE (r).required = true), ','
    ), '') AS required_configs
  FROM constructive_infra_public.platform_function_definitions
  WHERE is_invocable = true
  ORDER BY name
" 2>/dev/null)

if [ -z "$FUNCTIONS" ]; then
  echo "No invocable functions found in $DB_NAME"
  exit 1
fi

TOTAL_MISSING=0

while IFS='|' read -r fn_name secrets configs req_secrets req_configs; do
  echo "─── $fn_name ───"

  ALL_KEYS=""
  [ -n "$secrets" ] && ALL_KEYS="$secrets"
  [ -n "$configs" ] && { [ -n "$ALL_KEYS" ] && ALL_KEYS="$ALL_KEYS,$configs" || ALL_KEYS="$configs"; }

  MISSING=0
  SATISFIED=0

  IFS=',' read -ra KEYS <<< "$ALL_KEYS"
  for key in "${KEYS[@]}"; do
    [ -z "$key" ] && continue
    IS_REQUIRED=false
    [[ ",$req_secrets,$req_configs," == *",$key,"* ]] && IS_REQUIRED=true

    if [ -n "${ENV_VARS[$key]+x}" ]; then
      val="${ENV_VARS[$key]}"
      # Mask secret values (show first 4 chars)
      if [ ${#val} -gt 8 ]; then
        display="${val:0:4}****"
      else
        display="$val"
      fi
      echo "  ✓ $key = $display"
      ((SATISFIED++)) || true
    else
      if $IS_REQUIRED; then
        echo "  ✗ $key (REQUIRED — missing!)"
        ((MISSING++)) || true
        ((TOTAL_MISSING++)) || true
      else
        echo "  · $key (optional — not set)"
      fi
    fi
  done

  echo "  → $SATISFIED set, $MISSING missing"
  echo ""
done <<< "$FUNCTIONS"

if [ "$TOTAL_MISSING" -gt 0 ]; then
  echo "⚠  $TOTAL_MISSING required secret(s)/config(s) missing."
  echo "   Add them to $ENV_FILE and re-run."
  exit 1
else
  echo "All required secrets and configs are satisfied."
  echo ""
  echo "Start the compute-service:"
  echo "  set -a; source $ENV_FILE; set +a"
  echo "  PGDATABASE=$DB_NAME make dev-compute"
fi
