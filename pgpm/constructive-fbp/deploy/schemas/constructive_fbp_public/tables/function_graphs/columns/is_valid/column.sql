-- Deploy: schemas/constructive_fbp_public/tables/function_graphs/columns/is_valid/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/function_graphs/table


ALTER TABLE "constructive_fbp_public".function_graphs 
  ADD COLUMN is_valid boolean;

