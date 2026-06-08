-- Revert: schemas/constructive_store_private/tables/org_secrets/columns/namespace_id/column


ALTER TABLE "constructive_store_private".org_secrets 
  DROP COLUMN namespace_id RESTRICT;


