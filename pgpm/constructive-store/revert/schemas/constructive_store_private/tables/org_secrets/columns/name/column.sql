-- Revert: schemas/constructive_store_private/tables/org_secrets/columns/name/column


ALTER TABLE "constructive_store_private".org_secrets 
  DROP COLUMN name RESTRICT;


