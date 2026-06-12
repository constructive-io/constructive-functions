-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/graph_id/alterations/alt0000002667


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ALTER COLUMN graph_id DROP NOT NULL;


