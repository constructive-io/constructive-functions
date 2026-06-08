-- Revert: schemas/constructive_store_private/tables/platform_secrets/fixtures/standalone_compat
-- made with <3 @ constructive.io

BEGIN;

DROP INDEX IF EXISTS constructive_store_private.platform_secrets_namespace_id_name_idx;

ALTER TABLE constructive_store_private.platform_secrets
  ALTER COLUMN database_id DROP DEFAULT;

COMMIT;
