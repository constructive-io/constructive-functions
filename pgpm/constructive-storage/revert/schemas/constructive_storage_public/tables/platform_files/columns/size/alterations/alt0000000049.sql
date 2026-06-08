-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/size/alterations/alt0000000049


ALTER TABLE "constructive_storage_public".platform_files 
  ALTER COLUMN size DROP NOT NULL;


