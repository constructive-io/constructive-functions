-- Verify: schemas/constructive_compute_public/tables/platform_usage_daily/columns/database_id/column
-- made with <3 @ constructive.io

BEGIN;
SELECT database_id FROM "constructive_compute_public".platform_usage_daily WHERE false;
ROLLBACK;
