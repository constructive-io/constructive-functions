-- Verify: schemas/constructive_compute_public/tables/platform_compute_log/columns/task_identifier/column
-- made with <3 @ constructive.io

BEGIN;
SELECT task_identifier FROM "constructive_compute_public".platform_compute_log WHERE false;
ROLLBACK;
