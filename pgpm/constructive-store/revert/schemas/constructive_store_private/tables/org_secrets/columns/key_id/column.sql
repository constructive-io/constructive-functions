-- Revert: schemas/constructive_store_private/tables/org_secrets/columns/key_id/column


ALTER TABLE "constructive_store_private".org_secrets 
  DROP COLUMN key_id RESTRICT;


