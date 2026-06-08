-- Revert: schemas/constructive_objects_public/tables/commit/columns/store_id/column


ALTER TABLE "constructive_objects_public".commit 
  DROP COLUMN store_id RESTRICT;


