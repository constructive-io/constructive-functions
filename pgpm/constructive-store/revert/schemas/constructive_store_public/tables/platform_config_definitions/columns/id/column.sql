-- Revert: schemas/constructive_store_public/tables/platform_config_definitions/columns/id/column


ALTER TABLE "constructive_store_public".platform_config_definitions 
  DROP COLUMN id RESTRICT;


