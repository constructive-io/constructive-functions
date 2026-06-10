-- Deploy: schemas/constructive_store_public/tables/platform_config/columns/id/alterations/alt0000001982
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config/table
-- requires: schemas/constructive_store_public/tables/platform_config/columns/id/column


ALTER TABLE "constructive_store_public".platform_config 
  ALTER COLUMN id SET NOT NULL;

