-- Verify: schemas/constructive_compute_public/tables/platform_compute_log/columns/status/column
-- made with <3 @ constructive.io

BEGIN;
SELECT status FROM "constructive_compute_public".platform_compute_log WHERE false;
ROLLBACK;
