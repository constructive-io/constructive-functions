-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/indexes/platform_buckets_updated_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/table
-- requires: schemas/constructive_storage_public/tables/platform_buckets/columns/updated_at/column


CREATE INDEX platform_buckets_updated_at_idx ON "constructive_storage_public".platform_buckets ( updated_at );

