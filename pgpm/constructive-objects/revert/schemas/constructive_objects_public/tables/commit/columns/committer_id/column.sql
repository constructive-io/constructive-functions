-- Revert: schemas/constructive_objects_public/tables/commit/columns/committer_id/column


ALTER TABLE "constructive_objects_public".commit 
  DROP COLUMN committer_id RESTRICT;


