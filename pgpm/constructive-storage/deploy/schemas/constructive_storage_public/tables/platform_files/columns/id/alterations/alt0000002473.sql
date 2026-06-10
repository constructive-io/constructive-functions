-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/id/alterations/alt0000002473
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/id/column


ALTER TABLE "constructive_storage_public".platform_files 
  ALTER COLUMN id SET NOT NULL;

