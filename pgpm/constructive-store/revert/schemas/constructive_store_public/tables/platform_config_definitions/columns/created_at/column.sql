-- Revert: schemas/constructive_store_public/tables/platform_config_definitions/columns/created_at/column


ALTER TABLE "constructive_store_public".platform_config_definitions 
  DROP COLUMN created_at RESTRICT;


