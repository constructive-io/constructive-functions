-- Revert: schemas/constructive_objects_public/tables/object/columns/database_id/column


ALTER TABLE "constructive_objects_public".object 
  DROP COLUMN database_id RESTRICT;


