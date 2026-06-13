-- Revert: schemas/constructive_objects_public/tables/ref/columns/database_id/alterations/alt0000002550


ALTER TABLE "constructive_objects_public".ref 
  ALTER COLUMN database_id DROP NOT NULL;


