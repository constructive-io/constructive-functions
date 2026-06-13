-- Revert: schemas/constructive_objects_public/tables/store/columns/name/alterations/alt0000002519


ALTER TABLE "constructive_objects_public".store 
  ALTER COLUMN name DROP NOT NULL;


