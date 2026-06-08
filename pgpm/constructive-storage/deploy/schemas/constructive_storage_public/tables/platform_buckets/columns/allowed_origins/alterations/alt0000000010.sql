-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/columns/allowed_origins/alterations/alt0000000010
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/columns/allowed_origins/column


COMMENT ON COLUMN "constructive_storage_public".platform_buckets.allowed_origins IS E'Per-bucket CORS allowed origins override (NULL = inherit from storage_module/plugin defaults). Use ARRAY[''*''] for open/CDN mode.';

