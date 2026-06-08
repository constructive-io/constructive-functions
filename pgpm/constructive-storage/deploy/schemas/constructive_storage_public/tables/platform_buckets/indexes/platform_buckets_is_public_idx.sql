-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/indexes/platform_buckets_is_public_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/table
-- requires: schemas/constructive_storage_public/tables/platform_buckets/columns/is_public/column


CREATE INDEX platform_buckets_is_public_idx ON "constructive_storage_public".platform_buckets USING BTREE ( is_public );

