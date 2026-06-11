-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/output_node/alterations/alt0000002659


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ALTER COLUMN output_node DROP NOT NULL;


