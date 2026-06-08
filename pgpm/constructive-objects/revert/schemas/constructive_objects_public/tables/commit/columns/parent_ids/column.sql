-- Revert: schemas/constructive_objects_public/tables/commit/columns/parent_ids/column


ALTER TABLE "constructive_objects_public".commit 
  DROP COLUMN parent_ids RESTRICT;


