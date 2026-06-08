-- Revert: schemas/constructive_store_public/tables/platform_config/columns/updated_at/alterations/alt0000000093


ALTER TABLE "constructive_store_public".platform_config 
  ALTER COLUMN updated_at DROP DEFAULT;


