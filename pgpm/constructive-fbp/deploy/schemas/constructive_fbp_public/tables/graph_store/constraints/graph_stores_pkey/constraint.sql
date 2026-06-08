-- Deploy: schemas/constructive_fbp_public/tables/graph_store/constraints/graph_stores_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_store/table
-- requires: schemas/constructive_fbp_public/tables/graph_store/columns/id/column


ALTER TABLE "constructive_fbp_public".graph_store 
  ADD CONSTRAINT graph_stores_pkey PRIMARY KEY (id);

