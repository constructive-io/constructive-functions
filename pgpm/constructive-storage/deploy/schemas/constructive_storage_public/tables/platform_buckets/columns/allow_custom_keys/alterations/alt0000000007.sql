-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/columns/allow_custom_keys/alterations/alt0000000007
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/table
-- requires: schemas/constructive_storage_public/tables/platform_buckets/columns/allow_custom_keys/column


ALTER TABLE "constructive_storage_public".platform_buckets 
  ALTER COLUMN allow_custom_keys SET DEFAULT false;

