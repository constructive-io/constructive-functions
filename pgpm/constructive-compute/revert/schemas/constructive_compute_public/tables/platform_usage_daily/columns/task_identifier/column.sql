-- Revert: schemas/constructive_compute_public/tables/platform_usage_daily/columns/task_identifier/column


ALTER TABLE "constructive_compute_public".platform_usage_daily
  DROP COLUMN task_identifier RESTRICT;
