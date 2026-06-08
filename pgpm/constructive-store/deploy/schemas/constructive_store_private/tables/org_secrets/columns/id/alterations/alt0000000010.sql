-- Deploy: schemas/constructive_store_private/tables/org_secrets/columns/id/alterations/alt0000000010
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/table
-- requires: schemas/constructive_store_private/tables/org_secrets/columns/id/column


ALTER TABLE "constructive_store_private".org_secrets 
  ALTER COLUMN id SET NOT NULL;

