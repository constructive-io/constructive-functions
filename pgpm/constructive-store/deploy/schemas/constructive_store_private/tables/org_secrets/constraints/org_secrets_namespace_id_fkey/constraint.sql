-- Deploy: schemas/constructive_store_private/tables/org_secrets/constraints/org_secrets_namespace_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/table
-- requires: schemas/constructive_infra_public/tables/platform_namespaces/table
-- requires: schemas/constructive_store_private/tables/org_secrets/columns/namespace_id/column


ALTER TABLE "constructive_store_private".org_secrets 
  ADD CONSTRAINT org_secrets_namespace_id_fkey 
    FOREIGN KEY(namespace_id) 
    REFERENCES "constructive_infra_public".platform_namespaces (id) 
    ON DELETE RESTRICT;

