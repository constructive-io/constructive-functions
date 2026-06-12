-- Revert: schemas/constructive_compute_public/tables/platform_compute_log/table
-- made with <3 @ constructive.io

BEGIN;
DROP TABLE IF EXISTS "constructive_compute_public".platform_compute_log CASCADE;
COMMIT;
