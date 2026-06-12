-- Deploy: schemas/constructive_compute_public/tables/platform_compute_log/columns/task_identifier/alterations/alt_not_null
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_compute_log/table
-- requires: schemas/constructive_compute_public/tables/platform_compute_log/columns/task_identifier/column


ALTER TABLE "constructive_compute_public".platform_compute_log
  ALTER COLUMN task_identifier SET NOT NULL;
