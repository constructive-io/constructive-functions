-- Revert: schemas/constructive_objects_public/tables/object/columns/kids/column


ALTER TABLE "constructive_objects_public".object 
  DROP COLUMN kids RESTRICT;


