-- Deploy: schemas/constructive_storage_public/tables/platform_files/constraints/platform_files_bucket_id_key_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/bucket_id/column
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/key/column


ALTER TABLE "constructive_storage_public".platform_files 
  ADD CONSTRAINT platform_files_bucket_id_key_key 
    UNIQUE (bucket_id, key);

