-- Revert: schemas/constructive_compute_public/tables/platform_usage_daily/columns/min_duration_ms/column
-- made with <3 @ constructive.io

BEGIN;
ALTER TABLE "constructive_compute_public".platform_usage_daily DROP COLUMN IF EXISTS min_duration_ms;
COMMIT;
