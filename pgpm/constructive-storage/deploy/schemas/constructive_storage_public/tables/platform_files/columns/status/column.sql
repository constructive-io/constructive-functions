-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/status/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_public/types/file_status/type


ALTER TABLE "constructive_storage_public".platform_files 
  ADD COLUMN status "constructive_storage_public".file_status;

