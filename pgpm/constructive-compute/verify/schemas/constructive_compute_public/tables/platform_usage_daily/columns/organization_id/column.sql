-- Verify: schemas/constructive_compute_public/tables/platform_usage_daily/columns/organization_id/column
-- made with <3 @ constructive.io

BEGIN;
SELECT organization_id FROM "constructive_compute_public".platform_usage_daily WHERE false;
ROLLBACK;
