-- Revert: schemas/constructive_store_public/tables/platform_config/columns/expires_at/column


ALTER TABLE "constructive_store_public".platform_config 
  DROP COLUMN expires_at RESTRICT;


