-- Revert: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/max_ticks/alterations/alt0000002685


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  ALTER COLUMN max_ticks DROP DEFAULT;


