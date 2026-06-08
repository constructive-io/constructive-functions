-- Deploy: schemas/constructive_fbp_public/tables/function_graphs/columns/created_at/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/function_graphs/table


ALTER TABLE "constructive_fbp_public".function_graphs 
  ADD COLUMN created_at timestamptz;

