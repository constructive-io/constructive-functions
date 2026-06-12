-- Revert: schemas/constructive_compute_public/tables/platform_usage_daily/columns/organization_id/column
-- made with <3 @ constructive.io

BEGIN;
ALTER TABLE "constructive_compute_public".platform_usage_daily DROP COLUMN IF EXISTS organization_id;
COMMIT;
