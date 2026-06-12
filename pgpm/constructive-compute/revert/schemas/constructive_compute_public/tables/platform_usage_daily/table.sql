-- Revert: schemas/constructive_compute_public/tables/platform_usage_daily/table
-- made with <3 @ constructive.io

BEGIN;
DROP TABLE IF EXISTS "constructive_compute_public".platform_usage_daily CASCADE;
COMMIT;
