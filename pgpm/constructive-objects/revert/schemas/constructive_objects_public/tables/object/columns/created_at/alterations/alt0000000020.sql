-- Revert: schemas/constructive_objects_public/tables/object/columns/created_at/alterations/alt0000000020


ALTER TABLE "constructive_objects_public".object 
  ALTER COLUMN created_at DROP DEFAULT;


