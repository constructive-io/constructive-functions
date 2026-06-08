-- Revert: schemas/constructive_objects_public/tables/commit/columns/database_id/column


ALTER TABLE "constructive_objects_public".commit 
  DROP COLUMN database_id RESTRICT;


