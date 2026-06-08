-- Revert: schemas/constructive_store_private/tables/org_secrets/columns/owner_id/column


ALTER TABLE "constructive_store_private".org_secrets 
  DROP COLUMN owner_id RESTRICT;


