-- Deploy: schemas/constructive_objects_public/tables/store/columns/database_id/alterations/alt0000000046
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/store/table
-- requires: schemas/constructive_objects_public/tables/store/columns/database_id/column


ALTER TABLE "constructive_objects_public".store 
  ALTER COLUMN database_id SET NOT NULL;

