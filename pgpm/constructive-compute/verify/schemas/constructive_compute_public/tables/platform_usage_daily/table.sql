-- Verify: schemas/constructive_compute_public/tables/platform_usage_daily/table
-- made with <3 @ constructive.io

BEGIN;
SELECT 1 FROM "constructive_compute_public".platform_usage_daily WHERE false;
ROLLBACK;
