-- Revert: schemas/constructive_objects_public/tables/commit/columns/message/column


ALTER TABLE "constructive_objects_public".commit 
  DROP COLUMN message RESTRICT;


