-- Revert: schemas/constructive_objects_public/tables/commit/columns/author_id/column


ALTER TABLE "constructive_objects_public".commit 
  DROP COLUMN author_id RESTRICT;


