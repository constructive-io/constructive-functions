-- Deploy: schemas/constructive_store_public/tables/platform_config_definitions/columns/labels/alterations/alt0000002014
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config_definitions/table
-- requires: schemas/constructive_store_public/tables/platform_config_definitions/columns/labels/column


ALTER TABLE "constructive_store_public".platform_config_definitions 
  ALTER COLUMN labels SET NOT NULL;

