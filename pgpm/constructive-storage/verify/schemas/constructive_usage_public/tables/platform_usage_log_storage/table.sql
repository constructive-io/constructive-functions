-- Verify: schemas/constructive_usage_public/tables/platform_usage_log_storage/table

BEGIN;
SELECT 1 FROM "constructive_usage_public".platform_usage_log_storage WHERE false;
ROLLBACK;
