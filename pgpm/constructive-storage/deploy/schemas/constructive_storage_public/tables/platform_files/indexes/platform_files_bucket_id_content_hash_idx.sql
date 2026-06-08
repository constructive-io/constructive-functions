-- Deploy: schemas/constructive_storage_public/tables/platform_files/indexes/platform_files_bucket_id_content_hash_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/bucket_id/column
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/content_hash/column


CREATE INDEX platform_files_bucket_id_content_hash_idx ON "constructive_storage_public".platform_files USING BTREE ( bucket_id, content_hash );

