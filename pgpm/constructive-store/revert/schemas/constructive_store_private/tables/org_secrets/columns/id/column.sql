-- Revert: schemas/constructive_store_private/tables/org_secrets/columns/id/column


ALTER TABLE "constructive_store_private".org_secrets 
  DROP COLUMN id RESTRICT;


