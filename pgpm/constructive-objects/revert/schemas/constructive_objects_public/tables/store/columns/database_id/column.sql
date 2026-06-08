-- Revert: schemas/constructive_objects_public/tables/store/columns/database_id/column


ALTER TABLE "constructive_objects_public".store 
  DROP COLUMN database_id RESTRICT;


