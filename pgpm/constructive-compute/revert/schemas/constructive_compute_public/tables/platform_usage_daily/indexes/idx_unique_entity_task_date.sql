-- Revert: schemas/constructive_compute_public/tables/platform_usage_daily/indexes/idx_unique_entity_task_date
-- made with <3 @ constructive.io

BEGIN;
DROP INDEX IF EXISTS platform_usage_daily_entity_task_date_idx;
COMMIT;
