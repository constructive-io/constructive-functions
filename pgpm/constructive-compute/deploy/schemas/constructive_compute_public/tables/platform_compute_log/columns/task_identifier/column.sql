-- Deploy: schemas/constructive_compute_public/tables/platform_compute_log/columns/task_identifier/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_compute_log/table


ALTER TABLE "constructive_compute_public".platform_compute_log 
  ADD COLUMN task_identifier text;
