-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/output_port/column


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  DROP COLUMN output_port RESTRICT;


