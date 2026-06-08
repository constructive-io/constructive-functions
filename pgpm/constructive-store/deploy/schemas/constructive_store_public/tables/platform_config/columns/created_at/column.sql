-- Deploy: schemas/constructive_store_public/tables/platform_config/columns/created_at/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config/table


ALTER TABLE "constructive_store_public".platform_config 
  ADD COLUMN created_at timestamptz;

