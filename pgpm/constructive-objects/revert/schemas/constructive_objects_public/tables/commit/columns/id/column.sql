-- Revert: schemas/constructive_objects_public/tables/commit/columns/id/column


ALTER TABLE "constructive_objects_public".commit 
  DROP COLUMN id RESTRICT;


