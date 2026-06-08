-- Revert: schemas/constructive_fbp_private/tables/function_graph_executions/columns/node_outputs/alterations/alt0000000040


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  ALTER COLUMN node_outputs DROP DEFAULT;


