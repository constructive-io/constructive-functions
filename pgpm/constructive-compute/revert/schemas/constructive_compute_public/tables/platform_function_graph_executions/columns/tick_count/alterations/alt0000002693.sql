-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/tick_count/alterations/alt0000002693


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  ALTER COLUMN tick_count DROP NOT NULL;


