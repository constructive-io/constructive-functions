-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/is_public/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table


ALTER TABLE "constructive_storage_public".platform_files 
  ADD COLUMN is_public boolean;

