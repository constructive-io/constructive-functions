-- Revert: schemas/constructive_compute_public/tables/platform_usage_daily/columns/successful/alterations/alt_not_null


ALTER TABLE "constructive_compute_public".platform_usage_daily
  ALTER COLUMN successful DROP NOT NULL;
