-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/status/alterations/alt0000002498
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/status/column


COMMENT ON COLUMN "constructive_storage_public".platform_files.status IS E'File lifecycle status: requested (presigned URL generated, not yet in S3), uploaded (file in S3, ready for basic use), processed (MIME verified, image resized, embedding computed).';

