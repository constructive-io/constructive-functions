-- Revert: schemas/constructive_compute_public/tables/platform_usage_daily/columns/task_identifier/alterations/alt_not_null


ALTER TABLE "constructive_compute_public".platform_usage_daily
  ALTER COLUMN task_identifier DROP NOT NULL;
