-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/updated_at/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table


ALTER TABLE "constructive_storage_public".platform_files 
  ADD COLUMN updated_at timestamptz;

