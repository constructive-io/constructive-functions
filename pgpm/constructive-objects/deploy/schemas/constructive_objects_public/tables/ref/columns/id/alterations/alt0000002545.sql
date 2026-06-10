-- Deploy: schemas/constructive_objects_public/tables/ref/columns/id/alterations/alt0000002545
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/ref/table
-- requires: schemas/constructive_objects_public/tables/ref/columns/id/column


ALTER TABLE "constructive_objects_public".ref 
  ALTER COLUMN id SET NOT NULL;

