-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/filename/column


ALTER TABLE "constructive_storage_public".platform_files 
  DROP COLUMN filename RESTRICT;


