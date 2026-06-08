-- Deploy: schemas/constructive_objects_public/tables/commit/columns/store_id/alterations/alt0000000015
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/commit/table
-- requires: schemas/constructive_objects_public/tables/commit/columns/store_id/column


ALTER TABLE "constructive_objects_public".commit 
  ALTER COLUMN store_id SET NOT NULL;

