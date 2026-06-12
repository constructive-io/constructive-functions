-- Revert: schemas/constructive_compute_public/tables/platform_usage_daily/columns/total_calls/column


ALTER TABLE "constructive_compute_public".platform_usage_daily
  DROP COLUMN total_calls RESTRICT;
