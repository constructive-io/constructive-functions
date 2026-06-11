-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/database_id/alterations/alt0000002482


ALTER TABLE "constructive_storage_public".platform_files 
  ALTER COLUMN database_id DROP NOT NULL;


