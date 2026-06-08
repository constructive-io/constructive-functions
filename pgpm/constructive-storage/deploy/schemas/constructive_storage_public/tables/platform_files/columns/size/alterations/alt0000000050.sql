-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/size/alterations/alt0000000050
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/size/column


COMMENT ON COLUMN "constructive_storage_public".platform_files.size IS E'File size in bytes. Immutable after INSERT.';

