-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/is_public/alterations/alt0000000043


ALTER TABLE "constructive_storage_public".platform_files 
  ALTER COLUMN is_public DROP DEFAULT;


