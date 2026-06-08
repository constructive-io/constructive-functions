-- Deploy: schemas/constructive_objects_public/tables/commit/columns/tree_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/commit/table


ALTER TABLE "constructive_objects_public".commit 
  ADD COLUMN tree_id uuid;

