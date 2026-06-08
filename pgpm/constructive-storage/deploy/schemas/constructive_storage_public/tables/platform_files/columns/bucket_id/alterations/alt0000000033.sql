-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/bucket_id/alterations/alt0000000033
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/bucket_id/column


COMMENT ON COLUMN "constructive_storage_public".platform_files.bucket_id IS E'Bucket this file belongs to. Determines owner_id and is_public via inheritance trigger.';

