-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/size/column


ALTER TABLE "constructive_storage_public".platform_files 
  DROP COLUMN size RESTRICT;


