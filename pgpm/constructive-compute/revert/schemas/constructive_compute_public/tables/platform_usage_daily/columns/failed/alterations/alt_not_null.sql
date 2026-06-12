-- Revert: schemas/constructive_compute_public/tables/platform_usage_daily/columns/failed/alterations/alt_not_null


ALTER TABLE "constructive_compute_public".platform_usage_daily
  ALTER COLUMN failed DROP NOT NULL;
