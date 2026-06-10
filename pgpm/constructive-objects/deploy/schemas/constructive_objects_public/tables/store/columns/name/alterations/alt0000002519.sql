-- Deploy: schemas/constructive_objects_public/tables/store/columns/name/alterations/alt0000002519
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/store/table
-- requires: schemas/constructive_objects_public/tables/store/columns/name/column


ALTER TABLE "constructive_objects_public".store 
  ALTER COLUMN name SET NOT NULL;

