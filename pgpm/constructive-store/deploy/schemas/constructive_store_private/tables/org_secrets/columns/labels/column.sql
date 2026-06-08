-- Deploy: schemas/constructive_store_private/tables/org_secrets/columns/labels/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_store_private/schema
-- requires: schemas/constructive_store_private/tables/org_secrets/table


ALTER TABLE "constructive_store_private".org_secrets 
  ADD COLUMN labels jsonb;

