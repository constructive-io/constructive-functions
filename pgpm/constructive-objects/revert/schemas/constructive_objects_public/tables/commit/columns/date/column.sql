-- Revert: schemas/constructive_objects_public/tables/commit/columns/date/column


ALTER TABLE "constructive_objects_public".commit 
  DROP COLUMN date RESTRICT;


