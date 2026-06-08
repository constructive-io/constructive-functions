-- Deploy: schemas/constructive_objects_public/tables/ref/columns/name/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/ref/table


ALTER TABLE "constructive_objects_public".ref 
  ADD COLUMN name text;

