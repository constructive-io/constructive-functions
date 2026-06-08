-- Deploy: schemas/constructive_fbp_public/tables/function_graphs/columns/database_id/alterations/alt0000000070
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/function_graphs/table
-- requires: schemas/constructive_fbp_public/tables/function_graphs/columns/database_id/column


ALTER TABLE "constructive_fbp_public".function_graphs 
  ALTER COLUMN database_id SET NOT NULL;

