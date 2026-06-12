-- Revert: schemas/constructive_compute_public/tables/platform_usage_daily/columns/failed/alterations/alt_default


ALTER TABLE "constructive_compute_public".platform_usage_daily
  ALTER COLUMN failed DROP DEFAULT;
