-- Revert: schemas/constructive_store_private/tables/org_secrets/columns/labels/alterations/alt0000002036


ALTER TABLE "constructive_store_private".org_secrets 
  ALTER COLUMN labels DROP NOT NULL;


