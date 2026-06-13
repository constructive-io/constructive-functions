-- Revert: schemas/constructive_objects_public/tables/store/columns/id/column


ALTER TABLE "constructive_objects_public".store 
  DROP COLUMN id RESTRICT;


