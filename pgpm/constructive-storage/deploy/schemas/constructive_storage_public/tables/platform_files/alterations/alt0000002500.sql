-- Deploy: schemas/constructive_storage_public/tables/platform_files/alterations/alt0000002500
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table


COMMENT ON TABLE "constructive_storage_public".platform_files IS E'@storageFiles
Individual file records within buckets, with immutable identity fields and mutable metadata';

