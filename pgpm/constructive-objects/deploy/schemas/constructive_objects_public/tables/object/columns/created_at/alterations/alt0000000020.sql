-- Deploy: schemas/constructive_objects_public/tables/object/columns/created_at/alterations/alt0000000020
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/object/table
-- requires: schemas/constructive_objects_public/tables/object/columns/created_at/column


ALTER TABLE "constructive_objects_public".object 
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

