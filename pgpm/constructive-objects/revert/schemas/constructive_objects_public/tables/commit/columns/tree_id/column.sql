-- Revert: schemas/constructive_objects_public/tables/commit/columns/tree_id/column


ALTER TABLE "constructive_objects_public".commit 
  DROP COLUMN tree_id RESTRICT;


