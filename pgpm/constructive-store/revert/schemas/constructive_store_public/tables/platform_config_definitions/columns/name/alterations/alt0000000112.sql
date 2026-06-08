-- Revert: schemas/constructive_store_public/tables/platform_config_definitions/columns/name/alterations/alt0000000112


ALTER TABLE "constructive_store_public".platform_config_definitions 
  ALTER COLUMN name DROP NOT NULL;


