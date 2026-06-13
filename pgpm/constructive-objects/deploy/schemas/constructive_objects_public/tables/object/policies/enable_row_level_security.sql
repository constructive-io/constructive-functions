-- Deploy: schemas/constructive_objects_public/tables/object/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/object/table


ALTER TABLE "constructive_objects_public".object 
  ENABLE ROW LEVEL SECURITY;

