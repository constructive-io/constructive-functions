-- Deploy: schemas/constructive_fbp_public/tables/function_graphs/columns/name/alterations/alt0000000081
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/function_graphs/table
-- requires: schemas/constructive_fbp_public/tables/function_graphs/columns/name/column


ALTER TABLE "constructive_fbp_public".function_graphs 
  ALTER COLUMN name SET NOT NULL;

