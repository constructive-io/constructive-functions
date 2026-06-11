-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/key/alterations/alt0000002477
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/key/column


ALTER TABLE "constructive_storage_public".platform_files 
  ALTER COLUMN key SET NOT NULL;

