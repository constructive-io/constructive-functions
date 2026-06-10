-- Deploy: schemas/constructive_store_private/tables/org_secrets/columns/namespace_id/alterations/alt0000002030
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/table
-- requires: schemas/constructive_store_private/tables/org_secrets/columns/namespace_id/column


ALTER TABLE "constructive_store_private".org_secrets 
  ALTER COLUMN namespace_id SET NOT NULL;

