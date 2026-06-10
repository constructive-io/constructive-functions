-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/size/alterations/alt0000002491


ALTER TABLE "constructive_storage_public".platform_files 
  ALTER COLUMN size DROP NOT NULL;


