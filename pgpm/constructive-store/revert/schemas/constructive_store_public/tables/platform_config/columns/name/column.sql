-- Revert: schemas/constructive_store_public/tables/platform_config/columns/name/column


ALTER TABLE "constructive_store_public".platform_config 
  DROP COLUMN name RESTRICT;


