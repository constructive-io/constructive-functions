-- Deploy: schemas/constructive_storage_public/tables/platform_files/grants/authenticated/update/grant
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table


GRANT UPDATE (filename, description, tags) ON "constructive_storage_public".platform_files TO authenticated;

