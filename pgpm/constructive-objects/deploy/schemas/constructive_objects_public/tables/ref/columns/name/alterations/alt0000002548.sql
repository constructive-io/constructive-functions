-- Deploy: schemas/constructive_objects_public/tables/ref/columns/name/alterations/alt0000002548
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/ref/table
-- requires: schemas/constructive_objects_public/tables/ref/columns/name/column


ALTER TABLE "constructive_objects_public".ref 
  ALTER COLUMN name SET NOT NULL;

