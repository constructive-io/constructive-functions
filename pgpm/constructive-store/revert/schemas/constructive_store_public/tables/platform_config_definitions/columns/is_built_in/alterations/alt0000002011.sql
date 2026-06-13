-- Revert: schemas/constructive_store_public/tables/platform_config_definitions/columns/is_built_in/alterations/alt0000002011


ALTER TABLE "constructive_store_public".platform_config_definitions 
  ALTER COLUMN is_built_in DROP NOT NULL;


