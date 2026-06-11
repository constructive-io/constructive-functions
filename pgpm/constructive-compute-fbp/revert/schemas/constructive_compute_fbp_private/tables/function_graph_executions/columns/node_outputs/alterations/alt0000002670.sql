-- Revert: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/node_outputs/alterations/alt0000002670


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  ALTER COLUMN node_outputs DROP DEFAULT;


