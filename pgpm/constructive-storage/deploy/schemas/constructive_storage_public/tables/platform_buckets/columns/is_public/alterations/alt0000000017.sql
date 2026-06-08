-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/columns/is_public/alterations/alt0000000017
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/table
-- requires: schemas/constructive_storage_public/tables/platform_buckets/columns/is_public/column


ALTER TABLE "constructive_storage_public".platform_buckets 
  ALTER COLUMN is_public SET NOT NULL;

