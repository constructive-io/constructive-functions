-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/mime_type/column


ALTER TABLE "constructive_storage_public".platform_files 
  DROP COLUMN mime_type RESTRICT;


