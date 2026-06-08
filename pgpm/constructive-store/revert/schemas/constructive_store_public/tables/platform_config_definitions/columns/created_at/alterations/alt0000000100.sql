-- Revert: schemas/constructive_store_public/tables/platform_config_definitions/columns/created_at/alterations/alt0000000100


ALTER TABLE "constructive_store_public".platform_config_definitions 
  ALTER COLUMN created_at DROP DEFAULT;


