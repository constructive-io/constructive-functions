-- Deploy: schemas/constructive_store_private/tables/org_secrets/constraints/org_secrets_owner_id_namespace_id_name_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/table
-- requires: schemas/constructive_store_private/tables/org_secrets/columns/owner_id/column
-- requires: schemas/constructive_store_private/tables/org_secrets/columns/namespace_id/column
-- requires: schemas/constructive_store_private/tables/org_secrets/columns/name/column


ALTER TABLE "constructive_store_private".org_secrets 
  ADD CONSTRAINT org_secrets_owner_id_namespace_id_name_key 
    UNIQUE (owner_id, namespace_id, name);

