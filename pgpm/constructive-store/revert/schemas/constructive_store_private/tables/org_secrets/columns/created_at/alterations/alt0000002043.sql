-- Revert: schemas/constructive_store_private/tables/org_secrets/columns/created_at/alterations/alt0000002043


ALTER TABLE "constructive_store_private".org_secrets 
  ALTER COLUMN created_at DROP DEFAULT;


