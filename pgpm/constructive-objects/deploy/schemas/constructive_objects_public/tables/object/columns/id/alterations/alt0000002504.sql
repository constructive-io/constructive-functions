-- Deploy: schemas/constructive_objects_public/tables/object/columns/id/alterations/alt0000002504
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/object/table
-- requires: schemas/constructive_objects_public/tables/object/columns/id/column


ALTER TABLE "constructive_objects_public".object 
  ALTER COLUMN id SET NOT NULL;

