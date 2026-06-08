-- Revert: schemas/constructive_store_public/tables/platform_config/columns/labels/column


ALTER TABLE "constructive_store_public".platform_config 
  DROP COLUMN labels RESTRICT;


