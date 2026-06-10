-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/updated_at/alterations/alt0000002476


ALTER TABLE "constructive_storage_public".platform_files 
  ALTER COLUMN updated_at DROP DEFAULT;


