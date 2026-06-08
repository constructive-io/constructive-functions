-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/columns/type/alterations/alt0000000025
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/columns/type/column


COMMENT ON COLUMN "constructive_storage_public".platform_buckets.type IS E'Bucket CDN access type: public (CDN-served), private (presigned GET), temp (staging uploads)';

