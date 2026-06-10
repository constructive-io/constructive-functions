-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/size/alterations/alt0000002491
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/size/column


ALTER TABLE "constructive_storage_public".platform_files 
  ALTER COLUMN size SET NOT NULL;

