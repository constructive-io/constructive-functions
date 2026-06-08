-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/columns/description/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/table


ALTER TABLE "constructive_storage_public".platform_buckets 
  ADD COLUMN description text;

