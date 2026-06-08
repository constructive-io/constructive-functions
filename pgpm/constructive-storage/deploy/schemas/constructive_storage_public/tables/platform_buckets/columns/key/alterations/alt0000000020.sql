-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/columns/key/alterations/alt0000000020
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/table
-- requires: schemas/constructive_storage_public/tables/platform_buckets/columns/key/column


ALTER TABLE "constructive_storage_public".platform_buckets 
  ALTER COLUMN key SET NOT NULL;

