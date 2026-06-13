-- Deploy: schemas/constructive_objects_public/tables/ref/columns/database_id/alterations/alt0000002550
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/ref/table
-- requires: schemas/constructive_objects_public/tables/ref/columns/database_id/column


ALTER TABLE "constructive_objects_public".ref 
  ALTER COLUMN database_id SET NOT NULL;

