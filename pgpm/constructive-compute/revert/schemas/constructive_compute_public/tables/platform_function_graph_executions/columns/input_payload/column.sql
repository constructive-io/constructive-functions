-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/input_payload/column


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  DROP COLUMN input_payload RESTRICT;


