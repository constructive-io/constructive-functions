-- Revert: schemas/constructive_store_private/tables/org_secrets/columns/name/alterations/alt0000002032


ALTER TABLE "constructive_store_private".org_secrets 
  ALTER COLUMN name DROP NOT NULL;


