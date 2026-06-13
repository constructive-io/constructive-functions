-- Revert: schemas/constructive_store_public/tables/platform_config_definitions/columns/updated_at/column


ALTER TABLE "constructive_store_public".platform_config_definitions 
  DROP COLUMN updated_at RESTRICT;


