-- Verify: schemas/constructive_compute_public/tables/platform_usage_daily/columns/failed/column
-- made with <3 @ constructive.io

BEGIN;
SELECT failed FROM "constructive_compute_public".platform_usage_daily WHERE false;
ROLLBACK;
