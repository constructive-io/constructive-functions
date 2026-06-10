-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/tick_count/alterations/alt0000002721


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ALTER COLUMN tick_count DROP NOT NULL;


