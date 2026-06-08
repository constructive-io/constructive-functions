-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/filename/alterations/alt0000000039
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/filename/column


COMMENT ON COLUMN "constructive_storage_public".platform_files.filename IS E'Original filename provided by the uploader. Used for display and Content-Disposition header on download.';

