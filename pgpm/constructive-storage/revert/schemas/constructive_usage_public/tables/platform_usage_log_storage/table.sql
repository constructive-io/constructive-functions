-- Revert: schemas/constructive_usage_public/tables/platform_usage_log_storage/table

BEGIN;
DROP TABLE IF EXISTS "constructive_usage_public".platform_usage_log_storage CASCADE;
COMMIT;
