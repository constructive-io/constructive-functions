-- Deploy: schemas/constructive_objects_public/tables/ref/columns/store_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/ref/table


ALTER TABLE "constructive_objects_public".ref 
  ADD COLUMN store_id uuid;

