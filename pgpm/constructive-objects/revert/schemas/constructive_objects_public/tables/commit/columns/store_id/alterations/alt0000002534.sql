-- Revert: schemas/constructive_objects_public/tables/commit/columns/store_id/alterations/alt0000002534


ALTER TABLE "constructive_objects_public".commit 
  ALTER COLUMN store_id DROP NOT NULL;


