-- Deploy: schemas/constructive_fbp_public/tables/graph_ref/columns/name/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_ref/table


ALTER TABLE "constructive_fbp_public".graph_ref 
  ADD COLUMN name text;

