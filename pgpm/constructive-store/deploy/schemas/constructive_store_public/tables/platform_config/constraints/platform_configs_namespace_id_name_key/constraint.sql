-- Deploy: schemas/constructive_store_public/tables/platform_config/constraints/platform_configs_namespace_id_name_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config/table
-- requires: schemas/constructive_store_public/tables/platform_config/columns/namespace_id/column
-- requires: schemas/constructive_store_public/tables/platform_config/columns/name/column


ALTER TABLE "constructive_store_public".platform_config 
  ADD CONSTRAINT platform_configs_namespace_id_name_key 
    UNIQUE (namespace_id, name);

