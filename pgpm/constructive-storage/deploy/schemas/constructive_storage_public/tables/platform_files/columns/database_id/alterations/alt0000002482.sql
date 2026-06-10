-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/database_id/alterations/alt0000002482
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/database_id/column


ALTER TABLE "constructive_storage_public".platform_files 
  ALTER COLUMN database_id SET NOT NULL;

