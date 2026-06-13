-- Deploy: schemas/constructive_storage_public/tables/platform_files/indexes/platform_files_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/created_at/column


CREATE INDEX platform_files_created_at_idx ON "constructive_storage_public".platform_files ( created_at );

