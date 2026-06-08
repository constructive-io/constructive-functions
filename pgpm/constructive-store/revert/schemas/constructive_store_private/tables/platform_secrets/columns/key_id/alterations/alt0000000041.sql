-- Revert: schemas/constructive_store_private/tables/platform_secrets/columns/key_id/alterations/alt0000000041


ALTER TABLE "constructive_store_private".platform_secrets 
  ALTER COLUMN key_id DROP DEFAULT;


