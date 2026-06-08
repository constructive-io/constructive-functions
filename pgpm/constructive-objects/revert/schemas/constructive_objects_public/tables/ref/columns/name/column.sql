-- Revert: schemas/constructive_objects_public/tables/ref/columns/name/column


ALTER TABLE "constructive_objects_public".ref 
  DROP COLUMN name RESTRICT;


