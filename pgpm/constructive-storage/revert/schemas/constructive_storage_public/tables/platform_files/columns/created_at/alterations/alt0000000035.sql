-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/created_at/alterations/alt0000000035


ALTER TABLE "constructive_storage_public".platform_files 
  ALTER COLUMN created_at DROP DEFAULT;


