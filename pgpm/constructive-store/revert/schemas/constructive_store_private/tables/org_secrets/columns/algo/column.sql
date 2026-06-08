-- Revert: schemas/constructive_store_private/tables/org_secrets/columns/algo/column


ALTER TABLE "constructive_store_private".org_secrets 
  DROP COLUMN algo RESTRICT;


