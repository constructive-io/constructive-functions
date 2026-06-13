-- Verify: schemas/constructive_store_private/tables/platform_secrets/fixtures/standalone_compat

BEGIN;

SELECT indexname FROM pg_indexes WHERE indexname = 'platform_secrets_namespace_id_name_idx';

ROLLBACK;
