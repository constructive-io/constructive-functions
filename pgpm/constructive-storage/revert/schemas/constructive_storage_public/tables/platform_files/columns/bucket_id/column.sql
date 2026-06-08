-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/bucket_id/column


ALTER TABLE "constructive_storage_public".platform_files 
  DROP COLUMN bucket_id RESTRICT;


