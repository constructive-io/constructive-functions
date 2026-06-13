-- Revert: schemas/constructive_store_public/tables/platform_config_definitions/columns/labels/column


ALTER TABLE "constructive_store_public".platform_config_definitions 
  DROP COLUMN labels RESTRICT;


