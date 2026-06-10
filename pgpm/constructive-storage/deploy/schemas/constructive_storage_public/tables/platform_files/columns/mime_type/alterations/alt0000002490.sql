-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/mime_type/alterations/alt0000002490
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/mime_type/column


COMMENT ON COLUMN "constructive_storage_public".platform_files.mime_type IS E'MIME type of the file (e.g. image/png, application/pdf). Immutable after INSERT.';

