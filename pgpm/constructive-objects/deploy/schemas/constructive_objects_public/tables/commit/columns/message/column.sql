-- Deploy: schemas/constructive_objects_public/tables/commit/columns/message/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/commit/table


ALTER TABLE "constructive_objects_public".commit 
  ADD COLUMN message text;

