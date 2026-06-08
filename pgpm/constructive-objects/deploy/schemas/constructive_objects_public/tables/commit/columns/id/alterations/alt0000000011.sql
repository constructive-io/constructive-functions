-- Deploy: schemas/constructive_objects_public/tables/commit/columns/id/alterations/alt0000000011
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/commit/table
-- requires: schemas/constructive_objects_public/tables/commit/columns/id/column


ALTER TABLE "constructive_objects_public".commit 
  ALTER COLUMN id SET DEFAULT uuidv7();

