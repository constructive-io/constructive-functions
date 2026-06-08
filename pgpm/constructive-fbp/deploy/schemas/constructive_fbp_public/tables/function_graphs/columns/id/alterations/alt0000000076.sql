-- Deploy: schemas/constructive_fbp_public/tables/function_graphs/columns/id/alterations/alt0000000076
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/function_graphs/table
-- requires: schemas/constructive_fbp_public/tables/function_graphs/columns/id/column


ALTER TABLE "constructive_fbp_public".function_graphs 
  ALTER COLUMN id SET DEFAULT uuidv7();

