-- Verify: schemas/constructive_compute_public/tables/platform_usage_daily/columns/task_identifier/column
-- made with <3 @ constructive.io

BEGIN;
SELECT task_identifier FROM "constructive_compute_public".platform_usage_daily WHERE false;
ROLLBACK;
