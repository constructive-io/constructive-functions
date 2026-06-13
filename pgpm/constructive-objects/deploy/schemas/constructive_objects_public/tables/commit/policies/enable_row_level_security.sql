-- Deploy: schemas/constructive_objects_public/tables/commit/policies/enable_row_level_security
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/commit/table


ALTER TABLE "constructive_objects_public".commit 
  ENABLE ROW LEVEL SECURITY;

