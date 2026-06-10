-- Revert: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/current_wave/column


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  DROP COLUMN current_wave RESTRICT;


