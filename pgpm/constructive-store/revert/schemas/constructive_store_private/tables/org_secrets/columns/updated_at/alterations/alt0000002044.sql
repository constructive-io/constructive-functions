-- Revert: schemas/constructive_store_private/tables/org_secrets/columns/updated_at/alterations/alt0000002044


ALTER TABLE "constructive_store_private".org_secrets 
  ALTER COLUMN updated_at DROP DEFAULT;


