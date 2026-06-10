-- Revert: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/tick_count/alterations/alt0000002679


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  ALTER COLUMN tick_count DROP NOT NULL;


