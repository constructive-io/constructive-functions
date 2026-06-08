-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/created_at/column


ALTER TABLE "constructive_storage_public".platform_files 
  DROP COLUMN created_at RESTRICT;


