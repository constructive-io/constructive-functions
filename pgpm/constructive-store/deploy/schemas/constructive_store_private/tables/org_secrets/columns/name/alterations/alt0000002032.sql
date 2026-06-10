-- Deploy: schemas/constructive_store_private/tables/org_secrets/columns/name/alterations/alt0000002032
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/table
-- requires: schemas/constructive_store_private/tables/org_secrets/columns/name/column


ALTER TABLE "constructive_store_private".org_secrets 
  ALTER COLUMN name SET NOT NULL;

