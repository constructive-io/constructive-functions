-- Revert: schemas/constructive_store_public/tables/platform_config_definitions/columns/name/column


ALTER TABLE "constructive_store_public".platform_config_definitions 
  DROP COLUMN name RESTRICT;


