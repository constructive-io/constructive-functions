-- Deploy: schemas/constructive_fbp_public/tables/graph_object/columns/ktree/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_object/table


ALTER TABLE "constructive_fbp_public".graph_object 
  ADD COLUMN ktree text[];

