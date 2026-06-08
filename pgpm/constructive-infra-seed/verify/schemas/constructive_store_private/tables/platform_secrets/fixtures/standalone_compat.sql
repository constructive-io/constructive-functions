-- Verify: schemas/constructive_store_private/tables/platform_secrets/fixtures/standalone_compat
-- made with <3 @ constructive.io

BEGIN;

SELECT 1 FROM pg_catalog.pg_indexes
WHERE schemaname = 'constructive_store_private'
  AND tablename = 'platform_secrets'
  AND indexname = 'platform_secrets_namespace_id_name_idx';

ROLLBACK;
