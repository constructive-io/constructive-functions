-- Deploy: schemas/constructive_storage_public/tables/platform_files/columns/actor_id/alterations/alt0000000030
-- made with <3 @ constructive.io

-- requires: schemas/constructive_storage_public/schema
-- requires: schemas/constructive_storage_public/tables/platform_files/table
-- requires: schemas/constructive_storage_public/tables/platform_files/columns/actor_id/column


ALTER TABLE "constructive_storage_public".platform_files 
  ALTER COLUMN actor_id SET NOT NULL;

