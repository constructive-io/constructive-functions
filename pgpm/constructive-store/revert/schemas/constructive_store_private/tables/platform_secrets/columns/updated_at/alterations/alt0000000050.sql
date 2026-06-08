-- Revert: schemas/constructive_store_private/tables/platform_secrets/columns/updated_at/alterations/alt0000000050


ALTER TABLE "constructive_store_private".platform_secrets 
  ALTER COLUMN updated_at DROP DEFAULT;


