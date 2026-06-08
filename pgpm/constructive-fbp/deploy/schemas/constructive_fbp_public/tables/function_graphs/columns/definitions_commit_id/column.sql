-- Deploy: schemas/constructive_fbp_public/tables/function_graphs/columns/definitions_commit_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/function_graphs/table


ALTER TABLE "constructive_fbp_public".function_graphs 
  ADD COLUMN definitions_commit_id uuid;

