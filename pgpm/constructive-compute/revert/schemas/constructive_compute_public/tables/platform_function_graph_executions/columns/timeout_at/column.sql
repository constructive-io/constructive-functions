-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/timeout_at/column


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  DROP COLUMN timeout_at RESTRICT;


