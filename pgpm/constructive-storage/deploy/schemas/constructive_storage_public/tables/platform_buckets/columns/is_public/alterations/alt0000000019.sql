-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/columns/is_public/alterations/alt0000000019
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/columns/is_public/column


COMMENT ON COLUMN "constructive_storage_public".platform_buckets.is_public IS E'Whether bucket contents are publicly readable. Set to true when type is public.';

