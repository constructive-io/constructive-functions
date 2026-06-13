-- Revert: fixtures/seed_compute_log_tables

BEGIN;

DELETE FROM metaschema_public."table"
WHERE database_id = '00000000-0000-0000-0000-000000000000'
  AND name IN ('platform_compute_log', 'platform_usage_daily');

COMMIT;
