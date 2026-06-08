-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/columns/allow_custom_keys/alterations/alt0000000008
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/columns/allow_custom_keys/column


COMMENT ON COLUMN "constructive_storage_public".platform_buckets.allow_custom_keys IS E'When true, clients can provide custom S3 keys (e.g. reports/2024/Q1.pdf). When false (default), S3 key = content hash (automatic dedup). contentHash always required for integrity.';

