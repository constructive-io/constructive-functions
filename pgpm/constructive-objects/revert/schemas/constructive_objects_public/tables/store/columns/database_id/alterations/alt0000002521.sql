-- Revert: schemas/constructive_objects_public/tables/store/columns/database_id/alterations/alt0000002521


ALTER TABLE "constructive_objects_public".store 
  ALTER COLUMN database_id DROP NOT NULL;


