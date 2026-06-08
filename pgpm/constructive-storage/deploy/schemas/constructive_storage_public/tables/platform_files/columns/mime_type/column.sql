-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/mime_type/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table


ALTER TABLE "constructive_storage_public".platform_files 
  ADD COLUMN mime_type text;

