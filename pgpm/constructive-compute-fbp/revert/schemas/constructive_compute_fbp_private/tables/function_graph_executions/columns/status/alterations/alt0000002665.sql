-- Revert: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/status/alterations/alt0000002665


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  ALTER COLUMN status DROP DEFAULT;


