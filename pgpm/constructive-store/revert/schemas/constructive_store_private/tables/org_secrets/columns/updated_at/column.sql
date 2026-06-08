-- Revert: schemas/constructive_store_private/tables/org_secrets/columns/updated_at/column


ALTER TABLE "constructive_store_private".org_secrets 
  DROP COLUMN updated_at RESTRICT;


