-- Revert: schemas/constructive_objects_public/tables/object/columns/database_id/alterations/alt0000000023


ALTER TABLE "constructive_objects_public".object 
  ALTER COLUMN database_id DROP NOT NULL;


