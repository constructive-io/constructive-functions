-- Deploy: schemas/constructive_fbp_public/tables/graph_store/columns/id/alterations/alt0000000138
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_store/table
-- requires: schemas/constructive_fbp_public/tables/graph_store/columns/id/column


ALTER TABLE "constructive_fbp_public".graph_store 
  ALTER COLUMN id SET DEFAULT uuidv7();

