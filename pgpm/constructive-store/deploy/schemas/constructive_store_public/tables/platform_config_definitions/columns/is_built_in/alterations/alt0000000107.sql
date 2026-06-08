-- Deploy: schemas/constructive_store_public/tables/platform_config_definitions/columns/is_built_in/alterations/alt0000000107
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config_definitions/table
-- requires: schemas/constructive_store_public/tables/platform_config_definitions/columns/is_built_in/column


ALTER TABLE "constructive_store_public".platform_config_definitions 
  ALTER COLUMN is_built_in SET DEFAULT false;

