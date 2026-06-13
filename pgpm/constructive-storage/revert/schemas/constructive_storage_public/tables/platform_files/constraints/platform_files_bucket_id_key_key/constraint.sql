-- Revert: schemas/constructive_storage_public/tables/platform_files/constraints/platform_files_bucket_id_key_key/constraint


ALTER TABLE "constructive_storage_public".platform_files 
  DROP CONSTRAINT platform_files_bucket_id_key_key;


