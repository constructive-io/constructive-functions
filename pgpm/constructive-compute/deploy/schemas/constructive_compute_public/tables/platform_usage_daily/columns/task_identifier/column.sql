-- Deploy: schemas/constructive_compute_public/tables/platform_usage_daily/columns/task_identifier/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_usage_daily/table


ALTER TABLE "constructive_compute_public".platform_usage_daily 
  ADD COLUMN task_identifier text;
