-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_execution_outputs/columns/data/alterations/alt0000002645


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_outputs 
  ALTER COLUMN data DROP NOT NULL;


