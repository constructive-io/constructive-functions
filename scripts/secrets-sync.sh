#!/usr/bin/env bash
#
# secrets-sync.sh — bidirectional sync between .env and platform_secrets + platform_config
#
# Reads .env → upserts into real upstream tables, then reads DB → merges into .env.
# Priority on conflict: .env wins (values already in .env are not overwritten by DB).
#
# Usage:
#   ./scripts/secrets-sync.sh                       # defaults
#   ./scripts/secrets-sync.sh .env.local db8        # custom env file + database
#   DB_NAME=db8 ./scripts/secrets-sync.sh           # via env var

set -euo pipefail

ENV_FILE="${1:-.env}"
DB_NAME="${2:-${DB_NAME:-constructive-functions-db1}}"

DB_ID="00000000-0000-0000-0000-000000000000"

# Standalone JWT claims — upstream functions read database_id, user_id, etc.
# from session settings. In production these come from PostGraphile JWT middleware.
JWT_CLAIMS="
  SET LOCAL jwt.claims.database_id = '$DB_ID';
  SET LOCAL jwt.claims.user_id = '00000000-0000-0000-0000-000000000001';
  SET LOCAL jwt.claims.token_id = '00000000-0000-0000-0000-000000000002';
  SET LOCAL jwt.claims.session_id = '00000000-0000-0000-0000-000000000003';
  SET LOCAL jwt.claims.ip_address = '127.0.0.1';
  SET LOCAL jwt.claims.user_agent = 'constructive-functions/standalone';
  SET LOCAL jwt.claims.origin = 'http://localhost:3000';
"

echo "════════════════════════════════════════════════════════════"
echo "  Secrets Bidirectional Sync"
echo "  .env: $ENV_FILE    database: $DB_NAME"
echo "════════════════════════════════════════════════════════════"
echo ""

# Resolve namespace
NS_ID=$(psql -d "$DB_NAME" -t -A -c "
  SELECT id FROM constructive_infra_public.platform_namespaces
  WHERE name = 'default' AND database_id = '$DB_ID'
  LIMIT 1
" 2>/dev/null)

if [ -z "$NS_ID" ]; then
  echo "Error: default namespace not found in $DB_NAME."
  exit 1
fi

# Collect known secret/config names from function definitions
SECRET_NAMES=$(psql -d "$DB_NAME" -t -A -c "
  SELECT DISTINCT (r).name FROM constructive_compute_public.platform_function_definitions,
  unnest(required_secrets) AS r WHERE is_invocable = true
" 2>/dev/null || echo "")

CONFIG_NAMES=$(psql -d "$DB_NAME" -t -A -c "
  SELECT DISTINCT (r).name FROM constructive_compute_public.platform_function_definitions,
  unnest(required_configs) AS r WHERE is_invocable = true
" 2>/dev/null || echo "")

is_secret() { echo "$SECRET_NAMES" | grep -qx "$1" 2>/dev/null; }
is_config() { echo "$CONFIG_NAMES" | grep -qx "$1" 2>/dev/null; }

# --- Step 1: .env → DB ---

declare -A ENV_VARS
SYNCED_TO_DB=0

if [ -f "$ENV_FILE" ]; then
  while IFS= read -r line; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$line" ]] && continue
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*) ]]; then
      key="${BASH_REMATCH[1]}"
      val="${BASH_REMATCH[2]}"
      val="${val#\"}"
      val="${val%\"}"
      val="${val#\'}"
      val="${val%\'}"
      ENV_VARS["$key"]="$val"
    fi
  done < "$ENV_FILE"

  echo "Loaded ${#ENV_VARS[@]} variable(s) from $ENV_FILE"

  for key in "${!ENV_VARS[@]}"; do
    val="${ENV_VARS[$key]}"
    [ -z "$val" ] && continue
    escaped_val="${val//\'/\'\'}"

    if is_secret "$key"; then
      psql -d "$DB_NAME" -q -c "
        BEGIN;
        $JWT_CLAIMS
        SELECT constructive_store_public.platform_secrets_set(
          '$key', '$escaped_val', 'pgp', 'default'
        );
        COMMIT;
      " 2>/dev/null && ((SYNCED_TO_DB++)) || true
    elif is_config "$key"; then
      psql -d "$DB_NAME" -q -c "
        INSERT INTO constructive_store_public.platform_config
          (id, name, value, namespace_id)
        VALUES (gen_random_uuid(), '$key', '$escaped_val', '$NS_ID')
        ON CONFLICT (namespace_id, name)
        DO UPDATE SET value = '$escaped_val', updated_at = now()
      " 2>/dev/null && ((SYNCED_TO_DB++)) || true
    fi
  done

  echo "→ Synced $SYNCED_TO_DB values from .env → DB"
else
  echo "No .env file found at $ENV_FILE (will be created from DB values)"
fi

# --- Step 2: DB → .env ---

echo ""
echo "Reading configured values from DB..."

SYNCED_FROM_DB=0

# Read secrets (decrypted via platform_secrets_get)
DB_SECRETS=$(psql -d "$DB_NAME" -t -A -F '|' -c "
  BEGIN;
  $JWT_CLAIMS
  SELECT s.name,
         constructive_store_private.platform_secrets_get(s.name, NULL, 'default') AS val
  FROM constructive_store_private.platform_secrets s
  WHERE s.database_id = '$DB_ID' AND s.value IS NOT NULL
  ORDER BY s.name;
  COMMIT;
" 2>/dev/null || echo "")

if [ -n "$DB_SECRETS" ]; then
  while IFS='|' read -r name value; do
    [ -z "$name" ] && continue
    if [ -z "${ENV_VARS[$name]+x}" ]; then
      ENV_VARS["$name"]="$value"
      ((SYNCED_FROM_DB++)) || true
    fi
  done <<< "$DB_SECRETS"
fi

# Read configs
DB_CONFIGS=$(psql -d "$DB_NAME" -t -A -F '|' -c "
  SELECT name, value
  FROM constructive_store_public.platform_config
  WHERE value IS NOT NULL AND value != ''
  ORDER BY name
" 2>/dev/null || echo "")

if [ -n "$DB_CONFIGS" ]; then
  while IFS='|' read -r name value; do
    [ -z "$name" ] && continue
    if [ -z "${ENV_VARS[$name]+x}" ]; then
      ENV_VARS["$name"]="$value"
      ((SYNCED_FROM_DB++)) || true
    fi
  done <<< "$DB_CONFIGS"
fi

echo "→ Synced $SYNCED_FROM_DB new values from DB → .env"

# --- Step 3: Write merged .env ---

if [ ${#ENV_VARS[@]} -gt 0 ]; then
  {
    echo "# Auto-generated by secrets-sync — edits here are safe."
    echo "# Values can also be edited from http://localhost:5173 → Secrets tab."
    echo ""
    for key in $(echo "${!ENV_VARS[@]}" | tr ' ' '\n' | sort); do
      echo "$key=${ENV_VARS[$key]}"
    done
  } > "$ENV_FILE"
  echo ""
  echo "Wrote ${#ENV_VARS[@]} variable(s) to $ENV_FILE"
fi

echo ""
echo "Done. Total: $SYNCED_TO_DB → DB, $SYNCED_FROM_DB ← DB"
