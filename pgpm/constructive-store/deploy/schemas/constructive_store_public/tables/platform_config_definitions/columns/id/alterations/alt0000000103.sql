-- Deploy: schemas/constructive_store_public/tables/platform_config_definitions/columns/id/alterations/alt0000000103
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config_definitions/table
-- requires: schemas/constructive_store_public/tables/platform_config_definitions/columns/id/column


ALTER TABLE "constructive_store_public".platform_config_definitions 
  ALTER COLUMN id SET NOT NULL;

