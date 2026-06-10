-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/bucket_id/alterations/alt0000002480


ALTER TABLE "constructive_storage_public".platform_files 
  ALTER COLUMN bucket_id DROP NOT NULL;


