-- Verify: schemas/constructive_compute_public/tables/platform_compute_log/columns/duration_ms/column
-- made with <3 @ constructive.io

BEGIN;
SELECT duration_ms FROM "constructive_compute_public".platform_compute_log WHERE false;
ROLLBACK;
