-- Revert: schemas/constructive_store_private/tables/platform_secrets/columns/database_id/alterations/alt0000001960


ALTER TABLE "constructive_store_private".platform_secrets 
  ALTER COLUMN database_id DROP NOT NULL;


