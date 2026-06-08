-- Revert: schemas/constructive_store_private/tables/platform_secrets/columns/namespace_id/column


ALTER TABLE "constructive_store_private".platform_secrets 
  DROP COLUMN namespace_id RESTRICT;


