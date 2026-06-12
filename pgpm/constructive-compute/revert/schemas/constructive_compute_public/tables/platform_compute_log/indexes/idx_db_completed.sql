-- Revert: schemas/constructive_compute_public/tables/platform_compute_log/indexes/idx_db_completed
-- made with <3 @ constructive.io

BEGIN;
DROP INDEX IF EXISTS platform_compute_log_db_completed_idx;
COMMIT;
