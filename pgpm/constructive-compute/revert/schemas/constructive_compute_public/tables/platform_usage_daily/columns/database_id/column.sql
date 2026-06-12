-- Revert: schemas/constructive_compute_public/tables/platform_usage_daily/columns/database_id/column
-- made with <3 @ constructive.io

BEGIN;
ALTER TABLE "constructive_compute_public".platform_usage_daily DROP COLUMN IF EXISTS database_id;
COMMIT;
