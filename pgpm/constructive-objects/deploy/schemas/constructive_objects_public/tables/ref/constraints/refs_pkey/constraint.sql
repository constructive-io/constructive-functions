-- Deploy: schemas/constructive_objects_public/tables/ref/constraints/refs_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/ref/table
-- requires: schemas/constructive_objects_public/tables/ref/columns/id/column
-- requires: schemas/constructive_objects_public/tables/ref/columns/database_id/column


ALTER TABLE "constructive_objects_public".ref 
  ADD CONSTRAINT refs_pkey PRIMARY KEY (id, database_id);

