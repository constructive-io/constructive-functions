-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/constraints/platform_buckets_database_id_key_key/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/table
-- requires: schemas/constructive_storage_public/tables/platform_buckets/columns/database_id/column
-- requires: schemas/constructive_storage_public/tables/platform_buckets/columns/key/column


ALTER TABLE "constructive_storage_public".platform_buckets 
  ADD CONSTRAINT platform_buckets_database_id_key_key 
    UNIQUE (database_id, key);

