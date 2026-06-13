-- Deploy: schemas/constructive_objects_public/tables/store/columns/created_at/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/store/table


ALTER TABLE "constructive_objects_public".store 
  ADD COLUMN created_at timestamptz;

