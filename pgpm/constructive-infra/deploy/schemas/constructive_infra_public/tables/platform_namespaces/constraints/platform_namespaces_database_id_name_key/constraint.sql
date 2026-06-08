-- Deploy: schemas/constructive_infra_public/tables/platform_namespaces/constraints/platform_namespaces_database_id_name_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/table
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/columns/database_id/column
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/columns/name/column


ALTER TABLE "constructive_infra_public".platform_namespaces 
  ADD CONSTRAINT platform_namespaces_database_id_name_key 
    UNIQUE (database_id, name);

