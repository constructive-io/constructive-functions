-- Deploy: schemas/constructive_store_public/tables/platform_config_definitions/columns/is_built_in/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config_definitions/table


ALTER TABLE "constructive_store_public".platform_config_definitions 
  ADD COLUMN is_built_in boolean;

