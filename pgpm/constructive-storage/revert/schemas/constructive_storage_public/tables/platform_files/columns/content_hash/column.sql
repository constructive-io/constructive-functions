-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/content_hash/column


ALTER TABLE "constructive_storage_public".platform_files 
  DROP COLUMN content_hash RESTRICT;


