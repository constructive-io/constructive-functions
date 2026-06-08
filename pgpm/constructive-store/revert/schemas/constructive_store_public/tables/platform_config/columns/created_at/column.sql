-- Revert: schemas/constructive_store_public/tables/platform_config/columns/created_at/column


ALTER TABLE "constructive_store_public".platform_config 
  DROP COLUMN created_at RESTRICT;


