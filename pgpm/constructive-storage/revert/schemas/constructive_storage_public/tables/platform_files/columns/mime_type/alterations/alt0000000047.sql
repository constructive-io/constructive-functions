-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/mime_type/alterations/alt0000000047


ALTER TABLE "constructive_storage_public".platform_files 
  ALTER COLUMN mime_type DROP NOT NULL;


