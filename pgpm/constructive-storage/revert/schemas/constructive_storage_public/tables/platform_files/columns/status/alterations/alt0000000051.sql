-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/status/alterations/alt0000000051


ALTER TABLE "constructive_storage_public".platform_files 
  ALTER COLUMN status DROP NOT NULL;


