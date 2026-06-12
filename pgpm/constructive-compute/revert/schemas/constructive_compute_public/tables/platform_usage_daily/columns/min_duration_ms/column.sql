-- Revert: schemas/constructive_compute_public/tables/platform_usage_daily/columns/min_duration_ms/column


ALTER TABLE "constructive_compute_public".platform_usage_daily
  DROP COLUMN min_duration_ms RESTRICT;
