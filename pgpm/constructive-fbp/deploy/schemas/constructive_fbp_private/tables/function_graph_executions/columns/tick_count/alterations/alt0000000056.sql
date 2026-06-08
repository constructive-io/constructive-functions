-- Deploy: schemas/constructive_fbp_private/tables/function_graph_executions/columns/tick_count/alterations/alt0000000056
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_private/schema
-- requires: schemas/constructive_fbp_private/tables/function_graph_executions/table
-- requires: schemas/constructive_fbp_private/tables/function_graph_executions/columns/tick_count/column


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  ALTER COLUMN tick_count SET DEFAULT 0;

