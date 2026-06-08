#!/usr/bin/env bash
#
# load-platform-env.sh — load .env values into platform_secret_values and check coverage
#
# Reads your .env file, cross-references it against the required_secrets and
# required_configs declared in platform_function_definitions, reports coverage,
# and UPSERTs matching values into platform_secret_values so the platform can
# access them at runtime.
#
# Usage:
#   ./scripts/load-platform-env.sh                       # defaults to .env + constructive-functions-db1
#   ./scripts/load-platform-env.sh .env.local db8        # custom env file + database
#   DB_NAME=db8 ./scripts/load-platform-env.sh           # via env var

set -euo pipefail

ENV_FILE="${1:-.env}"
DB_NAME="${2:-${DB_NAME:-constructive-functions-db1}}"

DB_ID="00000000-0000-0000-0000-000000000000"

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
echo "  Platform Environment Sync"
echo "  .env: $ENV_FILE    database: $DB_NAME"
echo "════════════════════════════════════════════════════════════"
echo ""

# Load env file into newline-separated KEY=VALUE list (bash 3 compatible)
ENV_KEYS=""
ENV_COUNT=0
while IFS= read -r line; do
  case "$line" in \#*|"") continue ;; esac
  key="${line%%=*}"
  case "$key" in
    [A-Za-z_]*)
      ENV_KEYS="$ENV_KEYS
$key"
      ENV_COUNT=$((ENV_COUNT + 1))
      ;;
  esac
done < "$ENV_FILE"

# Also source the file so we can read values
set -a
. "$ENV_FILE"
set +a

has_env() {
  echo "$ENV_KEYS" | grep -qx "$1"
}

echo "Loaded $ENV_COUNT variable(s) from $ENV_FILE"
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
SYNCED=0
SYNC_KEYS=""

while IFS='|' read -r fn_name secrets configs req_secrets req_configs; do
  echo "─── $fn_name ───"

  ALL_KEYS=""
  [ -n "$secrets" ] && ALL_KEYS="$secrets"
  [ -n "$configs" ] && { [ -n "$ALL_KEYS" ] && ALL_KEYS="$ALL_KEYS,$configs" || ALL_KEYS="$configs"; }

  MISSING=0
  SATISFIED=0

  OLD_IFS="$IFS"; IFS=','
  for key in $ALL_KEYS; do
    IFS="$OLD_IFS"
    [ -z "$key" ] && continue
    IS_REQUIRED=false
    case ",$req_secrets,$req_configs," in *",$key,"*) IS_REQUIRED=true ;; esac

    if has_env "$key"; then
      eval "val=\${$key:-}"
      if [ ${#val} -gt 8 ]; then
        display="${val%"${val#????}"}****"
      else
        display="$val"
      fi
      echo "  ✓ $key = $display"
      SATISFIED=$((SATISFIED + 1))

      # Track for DB sync (deduplicate)
      case ",$SYNC_KEYS," in
        *",$key,"*) ;;
        *) SYNC_KEYS="${SYNC_KEYS:+$SYNC_KEYS,}$key" ;;
      esac
    else
      if $IS_REQUIRED; then
        echo "  ✗ $key (REQUIRED — missing!)"
        MISSING=$((MISSING + 1))
        TOTAL_MISSING=$((TOTAL_MISSING + 1))
      else
        echo "  · $key (optional — not set)"
      fi
    fi
  done
  IFS="$OLD_IFS"

  echo "  → $SATISFIED set, $MISSING missing"
  echo ""
done <<< "$FUNCTIONS"

# ─── Sync matched .env values into platform_secret_values ────────────────────

if [ -n "$SYNC_KEYS" ]; then
  echo "─── Syncing to platform_secret_values ───"

  OLD_IFS="$IFS"; IFS=','
  for key in $SYNC_KEYS; do
    IFS="$OLD_IFS"
    [ -z "$key" ] && continue
    eval "val=\${$key:-}"
    [ -z "$val" ] && continue

    # Escape single quotes for SQL
    escaped_val="${val//\'/\'\'}"

    psql -d "$DB_NAME" -q -c "
      INSERT INTO constructive_infra_public.platform_secret_values
        (secret_name, configured_value, database_id)
      VALUES ('$key', '$escaped_val', '$DB_ID')
      ON CONFLICT (secret_name, database_id)
      DO UPDATE SET configured_value = EXCLUDED.configured_value,
                    updated_at = now();
    " 2>/dev/null && {
      SYNCED=$((SYNCED + 1))
    } || {
      echo "  ⚠ Failed to sync $key"
    }
  done
  IFS="$OLD_IFS"

  echo "  ✓ Synced $SYNCED secret/config value(s) into DB"
  echo ""
fi

# ─── Summary ─────────────────────────────────────────────────────────────────

if [ "$TOTAL_MISSING" -gt 0 ]; then
  echo "⚠  $TOTAL_MISSING required secret(s)/config(s) missing."
  echo "   Add them to $ENV_FILE and re-run."
  exit 1
else
  echo "All required secrets and configs are satisfied."
  echo "$SYNCED value(s) loaded into platform_secret_values."
  echo ""
  echo "Start the compute-service:"
  echo "  set -a; source $ENV_FILE; set +a"
  echo "  PGDATABASE=$DB_NAME make dev-compute"
fi
