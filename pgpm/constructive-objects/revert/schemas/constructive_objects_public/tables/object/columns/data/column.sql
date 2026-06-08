-- Revert: schemas/constructive_objects_public/tables/object/columns/data/column


ALTER TABLE "constructive_objects_public".object 
  DROP COLUMN data RESTRICT;


