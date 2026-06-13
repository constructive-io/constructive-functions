-- Revert: schemas/constructive_store_public/tables/platform_config/columns/created_at/alterations/alt0000001997


ALTER TABLE "constructive_store_public".platform_config 
  ALTER COLUMN created_at DROP DEFAULT;


