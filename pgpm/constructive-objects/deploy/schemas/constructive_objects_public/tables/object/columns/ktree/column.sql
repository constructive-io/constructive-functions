-- Deploy: schemas/constructive_objects_public/tables/object/columns/ktree/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/object/table


ALTER TABLE "constructive_objects_public".object 
  ADD COLUMN ktree text[];

