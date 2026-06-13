-- Deploy: schemas/constructive_store_public/tables/platform_config/constraints/platform_configs_namespace_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_store_public/schema
-- requires: schemas/constructive_store_public/tables/platform_config/table
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/table
-- requires: schemas/constructive_store_public/tables/platform_config/columns/namespace_id/column


ALTER TABLE "constructive_store_public".platform_config 
  ADD CONSTRAINT platform_configs_namespace_id_fkey 
    FOREIGN KEY(namespace_id) 
    REFERENCES "constructive_infra_public".platform_namespaces (id) 
    ON DELETE RESTRICT;

