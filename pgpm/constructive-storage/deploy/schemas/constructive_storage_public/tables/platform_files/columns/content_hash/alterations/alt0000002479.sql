-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/content_hash/alterations/alt0000002479
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/content_hash/column


COMMENT ON COLUMN "constructive_storage_public".platform_files.content_hash IS E'SHA-256 content hash for integrity verification and dedup. In default mode, equals the S3 key. In custom key mode, stored separately.';

