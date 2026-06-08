-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/mime_type/alterations/alt0000000047
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/mime_type/column


ALTER TABLE "constructive_storage_public".platform_files 
  ALTER COLUMN mime_type SET NOT NULL;

