-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/key/alterations/alt0000002478
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/key/column


COMMENT ON COLUMN "constructive_storage_public".platform_files.key IS E'S3 object key for this file, unique within its bucket';

