-- Revert: schemas/constructive_objects_public/tables/store/columns/created_at/column


ALTER TABLE "constructive_objects_public".store 
  DROP COLUMN created_at RESTRICT;


