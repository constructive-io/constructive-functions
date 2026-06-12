-- Verify: schemas/constructive_compute_public/tables/platform_compute_log/columns/error/column
-- made with <3 @ constructive.io

BEGIN;
SELECT error FROM "constructive_compute_public".platform_compute_log WHERE false;
ROLLBACK;
