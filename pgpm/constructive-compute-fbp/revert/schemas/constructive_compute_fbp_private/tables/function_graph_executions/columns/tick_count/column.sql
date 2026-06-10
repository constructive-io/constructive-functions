-- Revert: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/tick_count/column


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  DROP COLUMN tick_count RESTRICT;


