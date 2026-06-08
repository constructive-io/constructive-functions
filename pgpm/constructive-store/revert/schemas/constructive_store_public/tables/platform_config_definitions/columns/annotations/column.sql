-- Revert: schemas/constructive_store_public/tables/platform_config_definitions/columns/annotations/column


ALTER TABLE "constructive_store_public".platform_config_definitions 
  DROP COLUMN annotations RESTRICT;


