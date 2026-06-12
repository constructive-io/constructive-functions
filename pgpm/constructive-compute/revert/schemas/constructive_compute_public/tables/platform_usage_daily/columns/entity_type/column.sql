-- Revert: schemas/constructive_compute_public/tables/platform_usage_daily/columns/entity_type/column
-- made with <3 @ constructive.io

BEGIN;
ALTER TABLE "constructive_compute_public".platform_usage_daily DROP COLUMN IF EXISTS entity_type;
COMMIT;
