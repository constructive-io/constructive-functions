-- Deploy: schemas/constructive_compute_public/tables/platform_usage_daily/columns/entity_type/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_usage_daily/table


ALTER TABLE "constructive_compute_public".platform_usage_daily 
  ADD COLUMN entity_type text;
