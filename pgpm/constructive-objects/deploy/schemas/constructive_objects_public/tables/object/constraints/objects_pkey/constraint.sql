-- Deploy: schemas/constructive_objects_public/tables/object/constraints/objects_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/object/table
-- requires: schemas/constructive_objects_public/tables/object/columns/id/column
-- requires: schemas/constructive_objects_public/tables/object/columns/database_id/column


ALTER TABLE "constructive_objects_public".object 
  ADD CONSTRAINT objects_pkey PRIMARY KEY (id, database_id);

