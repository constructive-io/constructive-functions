-- Revert: schemas/constructive_objects_public/tables/store/columns/name/column


ALTER TABLE "constructive_objects_public".store 
  DROP COLUMN name RESTRICT;


