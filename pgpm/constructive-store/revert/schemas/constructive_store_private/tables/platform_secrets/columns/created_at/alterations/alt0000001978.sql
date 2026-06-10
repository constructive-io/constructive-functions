-- Revert: schemas/constructive_store_private/tables/platform_secrets/columns/created_at/alterations/alt0000001978


ALTER TABLE "constructive_store_private".platform_secrets 
  ALTER COLUMN created_at DROP DEFAULT;


