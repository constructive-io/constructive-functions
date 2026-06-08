-- Revert: schemas/constructive_store_private/tables/platform_secrets/columns/database_id/column


ALTER TABLE "constructive_store_private".platform_secrets 
  DROP COLUMN database_id RESTRICT;


