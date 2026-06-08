-- Deploy: schemas/constructive_fbp_private/tables/function_graph_executions/columns/status/alterations/alt0000000051
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_private/schema
-- requires: schemas/constructive_fbp_private/tables/function_graph_executions/table
-- requires: schemas/constructive_fbp_private/tables/function_graph_executions/columns/status/column


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  ALTER COLUMN status SET NOT NULL;

