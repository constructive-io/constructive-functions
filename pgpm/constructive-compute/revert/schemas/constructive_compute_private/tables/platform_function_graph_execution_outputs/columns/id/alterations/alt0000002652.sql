-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_execution_outputs/columns/id/alterations/alt0000002652


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_outputs 
  ALTER COLUMN id DROP NOT NULL;


