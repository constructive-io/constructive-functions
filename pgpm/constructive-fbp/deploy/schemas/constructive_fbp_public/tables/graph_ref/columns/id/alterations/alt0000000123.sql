-- Deploy: schemas/constructive_fbp_public/tables/graph_ref/columns/id/alterations/alt0000000123
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_ref/table
-- requires: schemas/constructive_fbp_public/tables/graph_ref/columns/id/column


ALTER TABLE "constructive_fbp_public".graph_ref 
  ALTER COLUMN id SET NOT NULL;

