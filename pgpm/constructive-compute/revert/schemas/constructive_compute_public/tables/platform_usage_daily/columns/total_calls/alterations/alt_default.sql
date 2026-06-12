-- Revert: schemas/constructive_compute_public/tables/platform_usage_daily/columns/total_calls/alterations/alt_default


ALTER TABLE "constructive_compute_public".platform_usage_daily
  ALTER COLUMN total_calls DROP DEFAULT;
