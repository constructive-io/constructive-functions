-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/columns/database_id/alterations/alt0000000012
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/table
-- requires: schemas/constructive_storage_public/tables/platform_buckets/columns/database_id/column


ALTER TABLE "constructive_storage_public".platform_buckets 
  ALTER COLUMN database_id SET NOT NULL;

