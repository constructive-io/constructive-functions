-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/id/column


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  DROP COLUMN id RESTRICT;


