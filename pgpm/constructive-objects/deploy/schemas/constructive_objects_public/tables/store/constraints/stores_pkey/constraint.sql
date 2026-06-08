-- Deploy: schemas/constructive_objects_public/tables/store/constraints/stores_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_objects_public/schema
-- requires: schemas/constructive_objects_public/tables/store/table
-- requires: schemas/constructive_objects_public/tables/store/columns/id/column


ALTER TABLE "constructive_objects_public".store 
  ADD CONSTRAINT stores_pkey PRIMARY KEY (id);

