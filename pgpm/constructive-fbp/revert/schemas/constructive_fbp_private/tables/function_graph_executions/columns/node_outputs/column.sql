-- Revert: schemas/constructive_fbp_private/tables/function_graph_executions/columns/node_outputs/column


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  DROP COLUMN node_outputs RESTRICT;


