-- Deploy: schemas/constructive_objects_public/tables/object/columns/database_id/alterations/alt0000002506
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/object/table
-- requires: schemas/constructive_objects_public/tables/object/columns/database_id/column


ALTER TABLE "constructive_objects_public".object 
  ALTER COLUMN database_id SET NOT NULL;

