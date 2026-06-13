-- Revert: schemas/constructive_store_private/tables/org_secrets/columns/value/column


ALTER TABLE "constructive_store_private".org_secrets 
  DROP COLUMN value RESTRICT;


