-- Deploy: schemas/constructive_usage_public/tables/platform_usage_log_storage/columns/database_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_usage_public/schema
-- requires: schemas/constructive_usage_public/tables/platform_usage_log_storage/table

ALTER TABLE "constructive_usage_public".platform_usage_log_storage
  ADD COLUMN database_id uuid;
