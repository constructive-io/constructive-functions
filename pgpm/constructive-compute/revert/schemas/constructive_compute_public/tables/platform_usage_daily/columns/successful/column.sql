-- Revert: schemas/constructive_compute_public/tables/platform_usage_daily/columns/successful/column


ALTER TABLE "constructive_compute_public".platform_usage_daily
  DROP COLUMN successful RESTRICT;
