-- Deploy: schemas/constructive_compute_public/tables/platform_compute_log/indexes/idx_db_completed
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_compute_log/table
-- requires: schemas/constructive_compute_public/tables/platform_compute_log/columns/database_id/column

CREATE INDEX platform_compute_log_db_completed_idx
  ON "constructive_compute_public".platform_compute_log (database_id, completed_at);
