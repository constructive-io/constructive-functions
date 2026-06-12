-- Deploy: schemas/constructive_compute_public/tables/platform_usage_daily/columns/failed/alterations/alt_not_null
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_usage_daily/table
-- requires: schemas/constructive_compute_public/tables/platform_usage_daily/columns/failed/column


ALTER TABLE "constructive_compute_public".platform_usage_daily
  ALTER COLUMN failed SET NOT NULL;
