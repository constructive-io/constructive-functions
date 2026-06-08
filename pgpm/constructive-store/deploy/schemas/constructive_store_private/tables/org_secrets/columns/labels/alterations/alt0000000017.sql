-- Deploy: schemas/constructive_store_private/tables/org_secrets/columns/labels/alterations/alt0000000017
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/table
-- requires: schemas/constructive_store_private/tables/org_secrets/columns/labels/column


ALTER TABLE "constructive_store_private".org_secrets 
  ALTER COLUMN labels SET DEFAULT '{}'::jsonb;

