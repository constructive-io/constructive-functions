-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/updated_at/column


ALTER TABLE "constructive_storage_public".platform_files 
  DROP COLUMN updated_at RESTRICT;


