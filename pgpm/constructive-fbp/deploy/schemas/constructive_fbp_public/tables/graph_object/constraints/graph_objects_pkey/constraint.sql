-- Deploy: schemas/constructive_fbp_public/tables/graph_object/constraints/graph_objects_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_object/table
-- requires: schemas/constructive_fbp_public/tables/graph_object/columns/id/column
-- requires: schemas/constructive_fbp_public/tables/graph_object/columns/database_id/column


ALTER TABLE "constructive_fbp_public".graph_object 
  ADD CONSTRAINT graph_objects_pkey PRIMARY KEY (id, database_id);

