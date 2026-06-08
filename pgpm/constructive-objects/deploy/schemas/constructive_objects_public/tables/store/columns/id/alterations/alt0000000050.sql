-- Deploy: schemas/constructive_objects_public/tables/store/columns/id/alterations/alt0000000050
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/store/table
-- requires: schemas/constructive_objects_public/tables/store/columns/id/column


ALTER TABLE "constructive_objects_public".store 
  ALTER COLUMN id SET DEFAULT uuidv7();

