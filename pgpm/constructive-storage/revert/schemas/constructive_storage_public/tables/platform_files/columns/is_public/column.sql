-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/is_public/column


ALTER TABLE "constructive_storage_public".platform_files 
  DROP COLUMN is_public RESTRICT;


