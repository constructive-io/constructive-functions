-- Verify: schemas/constructive_compute_public/tables/platform_compute_log/table
-- made with <3 @ constructive.io

BEGIN;
SELECT 1 FROM "constructive_compute_public".platform_compute_log WHERE false;
ROLLBACK;
