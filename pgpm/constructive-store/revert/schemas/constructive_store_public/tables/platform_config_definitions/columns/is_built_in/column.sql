-- Revert: schemas/constructive_store_public/tables/platform_config_definitions/columns/is_built_in/column


ALTER TABLE "constructive_store_public".platform_config_definitions 
  DROP COLUMN is_built_in RESTRICT;


