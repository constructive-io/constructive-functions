-- Deploy: schemas/constructive_compute_public/tables/platform_usage_daily/indexes/idx_unique_entity_task_date
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_usage_daily/table
-- requires: schemas/constructive_compute_public/tables/platform_usage_daily/columns/database_id/column
-- requires: schemas/constructive_compute_public/tables/platform_usage_daily/columns/entity_id/column
-- requires: schemas/constructive_compute_public/tables/platform_usage_daily/columns/task_identifier/column
-- requires: schemas/constructive_compute_public/tables/platform_usage_daily/columns/date/column

CREATE UNIQUE INDEX platform_usage_daily_entity_task_date_idx
  ON "constructive_compute_public".platform_usage_daily (database_id, entity_id, task_identifier, date);
