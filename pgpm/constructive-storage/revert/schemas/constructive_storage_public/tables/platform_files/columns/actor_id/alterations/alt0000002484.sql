-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/actor_id/alterations/alt0000002484


ALTER TABLE "constructive_storage_public".platform_files 
  ALTER COLUMN actor_id DROP NOT NULL;


