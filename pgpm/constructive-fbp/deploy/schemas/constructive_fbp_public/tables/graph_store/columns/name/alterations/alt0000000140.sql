-- Deploy: schemas/constructive_fbp_public/tables/graph_store/columns/name/alterations/alt0000000140
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_store/table
-- requires: schemas/constructive_fbp_public/tables/graph_store/columns/name/column


ALTER TABLE "constructive_fbp_public".graph_store 
  ALTER COLUMN name SET NOT NULL;

