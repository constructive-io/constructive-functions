-- Deploy: schemas/constructive_objects_public/tables/store/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/store/table


ALTER TABLE "constructive_objects_public".store 
  ENABLE ROW LEVEL SECURITY;

