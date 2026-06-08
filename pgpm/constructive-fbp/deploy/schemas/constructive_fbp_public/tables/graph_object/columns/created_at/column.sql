-- Deploy: schemas/constructive_fbp_public/tables/graph_object/columns/created_at/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_object/table


ALTER TABLE "constructive_fbp_public".graph_object 
  ADD COLUMN created_at timestamptz;

