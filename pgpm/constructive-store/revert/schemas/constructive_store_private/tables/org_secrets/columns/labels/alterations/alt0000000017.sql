-- Revert: schemas/constructive_store_private/tables/org_secrets/columns/labels/alterations/alt0000000017


ALTER TABLE "constructive_store_private".org_secrets 
  ALTER COLUMN labels DROP DEFAULT;


