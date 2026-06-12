-- Deploy: schemas/constructive_compute_public/tables/platform_usage_daily/columns/successful/alterations/alt_default
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_usage_daily/table
-- requires: schemas/constructive_compute_public/tables/platform_usage_daily/columns/successful/column


ALTER TABLE "constructive_compute_public".platform_usage_daily
  ALTER COLUMN successful SET DEFAULT 0;
