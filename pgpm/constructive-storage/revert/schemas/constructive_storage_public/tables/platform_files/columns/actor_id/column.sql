-- Revert: schemas/constructive_storage_public/tables/platform_files/columns/actor_id/column


ALTER TABLE "constructive_storage_public".platform_files 
  DROP COLUMN actor_id RESTRICT;


