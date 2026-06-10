-- Revert: schemas/constructive_store_public/tables/platform_config_definitions/columns/created_at/alterations/alt0000002005


ALTER TABLE "constructive_store_public".platform_config_definitions 
  ALTER COLUMN created_at DROP DEFAULT;


