-- Revert: schemas/constructive_store_private/tables/platform_secrets/columns/key_id/column


ALTER TABLE "constructive_store_private".platform_secrets 
  DROP COLUMN key_id RESTRICT;


