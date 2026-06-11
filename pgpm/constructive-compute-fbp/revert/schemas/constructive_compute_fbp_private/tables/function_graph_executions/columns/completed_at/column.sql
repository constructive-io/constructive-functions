-- Revert: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/completed_at/column


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  DROP COLUMN completed_at RESTRICT;


