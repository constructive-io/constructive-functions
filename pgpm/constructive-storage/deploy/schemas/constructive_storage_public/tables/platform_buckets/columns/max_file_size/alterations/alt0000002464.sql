-- Deploy: schemas/constructive_storage_public/tables/platform_buckets/columns/max_file_size/alterations/alt0000002464
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_buckets/columns/max_file_size/column


COMMENT ON COLUMN "constructive_storage_public".platform_buckets.max_file_size IS E'Maximum file size in bytes allowed in this bucket (NULL = no limit, enforcement deferred)';

