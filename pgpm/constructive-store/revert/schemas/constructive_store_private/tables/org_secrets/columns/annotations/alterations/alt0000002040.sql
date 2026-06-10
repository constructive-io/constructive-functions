-- Revert: schemas/constructive_store_private/tables/org_secrets/columns/annotations/alterations/alt0000002040


ALTER TABLE "constructive_store_private".org_secrets 
  ALTER COLUMN annotations DROP DEFAULT;


