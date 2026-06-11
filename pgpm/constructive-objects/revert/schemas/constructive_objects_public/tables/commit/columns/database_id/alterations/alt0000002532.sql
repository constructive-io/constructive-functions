-- Revert: schemas/constructive_objects_public/tables/commit/columns/database_id/alterations/alt0000002532


ALTER TABLE "constructive_objects_public".commit 
  ALTER COLUMN database_id DROP NOT NULL;


