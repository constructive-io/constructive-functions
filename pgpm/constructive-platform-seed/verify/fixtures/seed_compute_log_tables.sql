-- Verify: fixtures/seed_compute_log_tables

BEGIN;

SELECT 1 FROM metaschema_public."table"
WHERE database_id = '00000000-0000-0000-0000-000000000000'
  AND name = 'platform_compute_log';

SELECT 1 FROM metaschema_public."table"
WHERE database_id = '00000000-0000-0000-0000-000000000000'
  AND name = 'platform_usage_daily';

ROLLBACK;
