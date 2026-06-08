-- Revert: schemas/constructive_objects_public/tables/ref/columns/store_id/column


ALTER TABLE "constructive_objects_public".ref 
  DROP COLUMN store_id RESTRICT;


