-- Revert: schemas/constructive_objects_public/tables/ref/columns/id/column


ALTER TABLE "constructive_objects_public".ref 
  DROP COLUMN id RESTRICT;


