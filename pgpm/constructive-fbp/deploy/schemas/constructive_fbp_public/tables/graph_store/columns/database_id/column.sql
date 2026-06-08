-- Deploy: schemas/constructive_fbp_public/tables/graph_store/columns/database_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_store/table


ALTER TABLE "constructive_fbp_public".graph_store 
  ADD COLUMN database_id uuid;

