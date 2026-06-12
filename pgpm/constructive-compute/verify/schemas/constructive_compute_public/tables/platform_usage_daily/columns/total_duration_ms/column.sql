-- Verify: schemas/constructive_compute_public/tables/platform_usage_daily/columns/total_duration_ms/column
-- made with <3 @ constructive.io

BEGIN;
SELECT total_duration_ms FROM "constructive_compute_public".platform_usage_daily WHERE false;
ROLLBACK;
