-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/graph_id/column


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  DROP COLUMN graph_id RESTRICT;


