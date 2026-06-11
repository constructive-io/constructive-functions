-- Deploy: schemas/constructive_objects_public/tables/ref/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/ref/table


ALTER TABLE "constructive_objects_public".ref 
  ENABLE ROW LEVEL SECURITY;

