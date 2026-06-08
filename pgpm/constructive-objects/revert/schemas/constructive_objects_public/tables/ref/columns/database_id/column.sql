-- Revert: schemas/constructive_objects_public/tables/ref/columns/database_id/column


ALTER TABLE "constructive_objects_public".ref 
  DROP COLUMN database_id RESTRICT;


