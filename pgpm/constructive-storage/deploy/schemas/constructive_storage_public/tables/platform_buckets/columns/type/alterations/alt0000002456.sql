-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/columns/type/alterations/alt0000002456
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/table
-- requires: schemas/constructive_storage_public/tables/platform_buckets/columns/type/column


ALTER TABLE "constructive_storage_public".platform_buckets 
  ALTER COLUMN type SET DEFAULT 'private';

