-- Deploy: schemas/constructive_store_public/tables/platform_config_definitions/constraints/platform_config_definitions_name_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config_definitions/table
-- requires: schemas/constructive_store_public/tables/platform_config_definitions/columns/name/column


ALTER TABLE "constructive_store_public".platform_config_definitions 
  ADD CONSTRAINT platform_config_definitions_name_key 
    UNIQUE (name);

