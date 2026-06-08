-- Deploy: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/columns/data/alterations/alt0000000004
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_private/schema
-- requires: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/table
-- requires: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/columns/data/column


ALTER TABLE "constructive_fbp_private".function_graph_execution_outputs 
  ALTER COLUMN data SET NOT NULL;

