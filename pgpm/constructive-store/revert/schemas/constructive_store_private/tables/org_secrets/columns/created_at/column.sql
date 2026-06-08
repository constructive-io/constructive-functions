-- Revert: schemas/constructive_store_private/tables/org_secrets/columns/created_at/column


ALTER TABLE "constructive_store_private".org_secrets 
  DROP COLUMN created_at RESTRICT;


