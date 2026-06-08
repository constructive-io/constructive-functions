-- Deploy: schemas/constructive_fbp_public/tables/graph_store/columns/database_id/alterations/alt0000000134
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_store/table
-- requires: schemas/constructive_fbp_public/tables/graph_store/columns/database_id/column


ALTER TABLE "constructive_fbp_public".graph_store 
  ALTER COLUMN database_id SET NOT NULL;

