-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/is_public/alterations/alt0000000042
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/is_public/column


ALTER TABLE "constructive_storage_public".platform_files 
  ALTER COLUMN is_public SET NOT NULL;

