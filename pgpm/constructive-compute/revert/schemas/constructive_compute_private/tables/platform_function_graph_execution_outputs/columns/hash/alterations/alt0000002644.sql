-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_execution_outputs/columns/hash/alterations/alt0000002644


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_outputs 
  ALTER COLUMN hash DROP NOT NULL;


