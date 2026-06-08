-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/database_id/column


ALTER TABLE "constructive_storage_public".platform_files 
  DROP COLUMN database_id RESTRICT;


