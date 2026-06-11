-- Revert: schemas/constructive_objects_public/tables/store/columns/created_at/alterations/alt0000002524


ALTER TABLE "constructive_objects_public".store 
  ALTER COLUMN created_at DROP DEFAULT;


