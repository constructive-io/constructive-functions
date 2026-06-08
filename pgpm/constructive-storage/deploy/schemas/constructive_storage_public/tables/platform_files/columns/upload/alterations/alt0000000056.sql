-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/upload/alterations/alt0000000056
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/upload/column


COMMENT ON COLUMN "constructive_storage_public".platform_files.upload IS E'Processed file reference (upload domain). Populated by processing jobs after file is uploaded. Copy this value to other tables to reference the file.';

