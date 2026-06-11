-- Revert: schemas/constructive_store_private/tables/platform_secrets/columns/name/alterations/alt0000001967


ALTER TABLE "constructive_store_private".platform_secrets 
  ALTER COLUMN name DROP NOT NULL;


