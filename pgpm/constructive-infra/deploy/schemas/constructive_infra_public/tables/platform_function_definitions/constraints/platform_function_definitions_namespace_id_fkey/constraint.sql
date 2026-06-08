-- Deploy: schemas/constructive_infra_public/tables/platform_function_definitions/constraints/platform_function_definitions_namespace_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/table
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/table
-- requires: schemas/constructive_infra_public/tables/platform_function_definitions/columns/namespace_id/column
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/columns/id/column
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/constraints/platform_namespaces_database_id_name_key/constraint
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/constraints/platform_namespaces_namespace_name_key/constraint
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/constraints/platform_namespaces_pkey/constraint


ALTER TABLE "constructive_infra_public".platform_function_definitions 
  ADD CONSTRAINT platform_function_definitions_namespace_id_fkey 
    FOREIGN KEY(namespace_id) 
    REFERENCES "constructive_infra_public".platform_namespaces (id) 
    ON DELETE SET NULL;

