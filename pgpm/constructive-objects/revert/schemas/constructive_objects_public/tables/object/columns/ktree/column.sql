-- Revert: schemas/constructive_objects_public/tables/object/columns/ktree/column


ALTER TABLE "constructive_objects_public".object 
  DROP COLUMN ktree RESTRICT;


