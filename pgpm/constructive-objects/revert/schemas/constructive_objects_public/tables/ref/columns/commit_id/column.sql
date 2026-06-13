-- Revert: schemas/constructive_objects_public/tables/ref/columns/commit_id/column


ALTER TABLE "constructive_objects_public".ref 
  DROP COLUMN commit_id RESTRICT;


