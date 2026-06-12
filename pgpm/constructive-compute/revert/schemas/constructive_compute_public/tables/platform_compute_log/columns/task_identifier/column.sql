-- Revert: schemas/constructive_compute_public/tables/platform_compute_log/columns/task_identifier/column
-- made with <3 @ constructive.io

BEGIN;
ALTER TABLE "constructive_compute_public".platform_compute_log DROP COLUMN IF EXISTS task_identifier;
COMMIT;
