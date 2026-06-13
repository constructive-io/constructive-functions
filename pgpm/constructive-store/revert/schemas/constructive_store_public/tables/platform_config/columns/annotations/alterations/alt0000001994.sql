-- Revert: schemas/constructive_store_public/tables/platform_config/columns/annotations/alterations/alt0000001994


ALTER TABLE "constructive_store_public".platform_config 
  ALTER COLUMN annotations DROP DEFAULT;


