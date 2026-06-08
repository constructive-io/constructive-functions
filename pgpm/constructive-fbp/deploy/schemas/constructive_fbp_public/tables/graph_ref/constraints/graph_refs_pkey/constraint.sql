-- Deploy: schemas/constructive_fbp_public/tables/graph_ref/constraints/graph_refs_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_ref/table
-- requires: schemas/constructive_fbp_public/tables/graph_ref/columns/id/column
-- requires: schemas/constructive_fbp_public/tables/graph_ref/columns/database_id/column


ALTER TABLE "constructive_fbp_public".graph_ref 
  ADD CONSTRAINT graph_refs_pkey PRIMARY KEY (id, database_id);

