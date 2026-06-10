-- Deploy: schemas/constructive_store_public/tables/platform_config/columns/name/alterations/alt0000001987
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config/table
-- requires: schemas/constructive_store_public/tables/platform_config/columns/name/column


ALTER TABLE "constructive_store_public".platform_config 
  ALTER COLUMN name SET NOT NULL;

