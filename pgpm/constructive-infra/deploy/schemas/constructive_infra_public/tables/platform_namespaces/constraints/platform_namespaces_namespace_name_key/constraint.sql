-- Deploy: schemas/constructive_infra_public/tables/platform_namespaces/constraints/platform_namespaces_namespace_name_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/table


ALTER TABLE "constructive_infra_public".platform_namespaces 
  ADD CONSTRAINT platform_namespaces_namespace_name_key 
    UNIQUE (namespace_name);

