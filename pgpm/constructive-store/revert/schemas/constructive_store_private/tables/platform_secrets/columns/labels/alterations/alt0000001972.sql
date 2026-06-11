-- Revert: schemas/constructive_store_private/tables/platform_secrets/columns/labels/alterations/alt0000001972


ALTER TABLE "constructive_store_private".platform_secrets 
  ALTER COLUMN labels DROP DEFAULT;


