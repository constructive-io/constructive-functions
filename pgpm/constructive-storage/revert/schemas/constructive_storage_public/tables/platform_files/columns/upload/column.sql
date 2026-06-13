-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/upload/column


ALTER TABLE "constructive_storage_public".platform_files 
  DROP COLUMN upload RESTRICT;


