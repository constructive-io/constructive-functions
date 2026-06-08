-- Deploy: schemas/constructive_fbp_public/tables/graph_object/columns/created_at/alterations/alt0000000108
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_object/table
-- requires: schemas/constructive_fbp_public/tables/graph_object/columns/created_at/column


ALTER TABLE "constructive_fbp_public".graph_object 
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

