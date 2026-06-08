-- Deploy: schemas/constructive_fbp_public/tables/function_graphs/columns/is_valid/alterations/alt0000000079
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/function_graphs/table
-- requires: schemas/constructive_fbp_public/tables/function_graphs/columns/is_valid/column


ALTER TABLE "constructive_fbp_public".function_graphs 
  ALTER COLUMN is_valid SET DEFAULT false;

