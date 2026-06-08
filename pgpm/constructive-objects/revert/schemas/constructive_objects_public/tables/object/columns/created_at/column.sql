-- Revert: schemas/constructive_objects_public/tables/object/columns/created_at/column


ALTER TABLE "constructive_objects_public".object 
  DROP COLUMN created_at RESTRICT;


