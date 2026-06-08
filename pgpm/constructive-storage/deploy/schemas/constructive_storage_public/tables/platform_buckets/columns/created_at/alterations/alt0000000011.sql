-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/columns/created_at/alterations/alt0000000011
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/table
-- requires: schemas/constructive_storage_public/tables/platform_buckets/columns/created_at/column


ALTER TABLE "constructive_storage_public".platform_buckets 
  ALTER COLUMN created_at SET DEFAULT now();

