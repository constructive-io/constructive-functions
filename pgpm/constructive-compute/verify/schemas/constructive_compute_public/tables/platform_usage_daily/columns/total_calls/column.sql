-- Verify: schemas/constructive_compute_public/tables/platform_usage_daily/columns/total_calls/column
-- made with <3 @ constructive.io

BEGIN;
SELECT total_calls FROM "constructive_compute_public".platform_usage_daily WHERE false;
ROLLBACK;
