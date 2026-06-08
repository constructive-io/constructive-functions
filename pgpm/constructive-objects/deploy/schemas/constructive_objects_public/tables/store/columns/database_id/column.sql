-- Deploy: schemas/constructive_objects_public/tables/store/columns/database_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/store/table


ALTER TABLE "constructive_objects_public".store 
  ADD COLUMN database_id uuid;

