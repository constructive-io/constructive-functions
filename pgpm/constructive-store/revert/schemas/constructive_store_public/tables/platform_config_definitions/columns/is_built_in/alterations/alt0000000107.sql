-- Revert: schemas/constructive_store_public/tables/platform_config_definitions/columns/is_built_in/alterations/alt0000000107


ALTER TABLE "constructive_store_public".platform_config_definitions 
  ALTER COLUMN is_built_in DROP DEFAULT;


