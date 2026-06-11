-- Deploy: schemas/constructive_objects_public/tables/commit/columns/date/alterations/alt0000002540
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/commit/table
-- requires: schemas/constructive_objects_public/tables/commit/columns/date/column


ALTER TABLE "constructive_objects_public".commit 
  ALTER COLUMN date SET NOT NULL;

