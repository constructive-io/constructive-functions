-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/columns/key/alterations/alt0000002452
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/columns/key/column


COMMENT ON COLUMN "constructive_storage_public".platform_buckets.key IS E'Unique bucket identifier used in S3 key paths (e.g. avatars, documents, temp)';

