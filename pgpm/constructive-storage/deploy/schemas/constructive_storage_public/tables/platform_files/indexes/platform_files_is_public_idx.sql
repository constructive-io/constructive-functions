-- Deploy: schemas/constructive_storage_public/tables/platform_files/indexes/platform_files_is_public_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/is_public/column


CREATE INDEX platform_files_is_public_idx ON "constructive_storage_public".platform_files USING BTREE ( is_public );

