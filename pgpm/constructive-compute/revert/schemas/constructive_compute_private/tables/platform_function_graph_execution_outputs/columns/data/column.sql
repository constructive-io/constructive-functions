-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_execution_outputs/columns/data/column


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_outputs 
  DROP COLUMN data RESTRICT;


