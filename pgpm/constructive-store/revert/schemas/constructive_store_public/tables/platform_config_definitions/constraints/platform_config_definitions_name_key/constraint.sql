-- Revert: schemas/constructive_store_public/tables/platform_config_definitions/constraints/platform_config_definitions_name_key/constraint


ALTER TABLE "constructive_store_public".platform_config_definitions 
  DROP CONSTRAINT platform_config_definitions_name_key;


