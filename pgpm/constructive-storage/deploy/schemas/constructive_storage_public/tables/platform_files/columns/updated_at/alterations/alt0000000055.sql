-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/updated_at/alterations/alt0000000055
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/updated_at/column


ALTER TABLE "constructive_storage_public".platform_files 
  ALTER COLUMN updated_at SET DEFAULT now();

