-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/created_at/alterations/alt0000002475
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/created_at/column


ALTER TABLE "constructive_storage_public".platform_files 
  ALTER COLUMN created_at SET DEFAULT now();

