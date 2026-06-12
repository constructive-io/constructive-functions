-- Revert: schemas/constructive_compute_public/tables/platform_usage_daily/columns/database_id/column


ALTER TABLE "constructive_compute_public".platform_usage_daily
  DROP COLUMN database_id RESTRICT;
