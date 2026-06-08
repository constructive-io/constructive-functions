-- Revert: schemas/constructive_store_public/tables/platform_config_definitions/columns/updated_at/alterations/alt0000000114


ALTER TABLE "constructive_store_public".platform_config_definitions 
  ALTER COLUMN updated_at DROP DEFAULT;


