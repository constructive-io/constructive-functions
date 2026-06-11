-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/key/alterations/alt0000002477


ALTER TABLE "constructive_storage_public".platform_files 
  ALTER COLUMN key DROP NOT NULL;


