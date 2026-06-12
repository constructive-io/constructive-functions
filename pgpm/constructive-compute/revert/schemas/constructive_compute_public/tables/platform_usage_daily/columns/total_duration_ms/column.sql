-- Revert: schemas/constructive_compute_public/tables/platform_usage_daily/columns/total_duration_ms/column


ALTER TABLE "constructive_compute_public".platform_usage_daily
  DROP COLUMN total_duration_ms RESTRICT;
