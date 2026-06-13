-- Deploy: schemas/constructive_store_private/tables/platform_secrets/constraints/platform_secrets_namespace_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/platform_secrets/table
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/table
-- requires: schemas/constructive_store_private/tables/platform_secrets/columns/namespace_id/column


ALTER TABLE "constructive_store_private".platform_secrets 
  ADD CONSTRAINT platform_secrets_namespace_id_fkey 
    FOREIGN KEY(namespace_id) 
    REFERENCES "constructive_infra_public".platform_namespaces (id) 
    ON DELETE RESTRICT;

