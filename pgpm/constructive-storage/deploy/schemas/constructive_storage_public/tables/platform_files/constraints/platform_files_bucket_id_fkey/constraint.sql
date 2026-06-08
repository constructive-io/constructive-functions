-- Deploy: schemas/constructive_storage_public/tables/platform_files/constraints/platform_files_bucket_id_fkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_public/tables/platform_buckets/table
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/bucket_id/column
-- requires: schemas/constructive_storage_public/tables/platform_buckets/columns/id/column
-- requires: schemas/constructive_storage_public/tables/platform_buckets/constraints/platform_buckets_database_id_key_key/constraint
-- requires: schemas/constructive_storage_public/tables/platform_buckets/constraints/platform_buckets_pkey/constraint


ALTER TABLE "constructive_storage_public".platform_files 
  ADD CONSTRAINT platform_files_bucket_id_fkey 
    FOREIGN KEY(bucket_id) 
    REFERENCES "constructive_storage_public".platform_buckets (id) 
    ON DELETE RESTRICT;

