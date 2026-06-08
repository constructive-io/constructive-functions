-- Revert: schemas/constructive_objects_public/tables/store/columns/hash/column


ALTER TABLE "constructive_objects_public".store 
  DROP COLUMN hash RESTRICT;


