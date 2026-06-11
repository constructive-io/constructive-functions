-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/status/alterations/alt0000002497
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/status/column


ALTER TABLE "constructive_storage_public".platform_files 
  ALTER COLUMN status SET DEFAULT 'requested';

