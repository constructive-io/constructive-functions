-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/bucket_id/alterations/alt0000002480
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/bucket_id/column


ALTER TABLE "constructive_storage_public".platform_files 
  ALTER COLUMN bucket_id SET NOT NULL;

