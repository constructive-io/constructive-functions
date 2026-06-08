-- Revert: schemas/constructive_objects_public/tables/object/columns/id/column


ALTER TABLE "constructive_objects_public".object 
  DROP COLUMN id RESTRICT;


