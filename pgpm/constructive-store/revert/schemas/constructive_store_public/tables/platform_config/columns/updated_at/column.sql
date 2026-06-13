-- Revert: schemas/constructive_store_public/tables/platform_config/columns/updated_at/column


ALTER TABLE "constructive_store_public".platform_config 
  DROP COLUMN updated_at RESTRICT;


