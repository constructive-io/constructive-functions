-- Deploy: schemas/constructive_compute_public/tables/platform_compute_log/indexes/idx_task_completed
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_compute_log/table
-- requires: schemas/constructive_compute_public/tables/platform_compute_log/columns/task_identifier/column

CREATE INDEX platform_compute_log_task_completed_idx
  ON "constructive_compute_public".platform_compute_log (task_identifier, completed_at);
