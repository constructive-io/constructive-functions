-- Revert: schemas/constructive_objects_public/tables/store/columns/created_at/alterations/alt0000000044


ALTER TABLE "constructive_objects_public".store 
  ALTER COLUMN created_at DROP DEFAULT;


