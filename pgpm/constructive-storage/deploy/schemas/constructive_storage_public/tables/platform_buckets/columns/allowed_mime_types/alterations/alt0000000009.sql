-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/columns/allowed_mime_types/alterations/alt0000000009
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/columns/allowed_mime_types/column


COMMENT ON COLUMN "constructive_storage_public".platform_buckets.allowed_mime_types IS E'Whitelist of allowed MIME types for files in this bucket (NULL = all allowed, enforcement deferred)';

