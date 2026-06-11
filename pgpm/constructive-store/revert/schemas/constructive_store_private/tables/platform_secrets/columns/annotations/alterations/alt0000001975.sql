-- Revert: schemas/constructive_store_private/tables/platform_secrets/columns/annotations/alterations/alt0000001975


ALTER TABLE "constructive_store_private".platform_secrets 
  ALTER COLUMN annotations DROP DEFAULT;


