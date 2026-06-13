-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/output_port/alterations/alt0000002663


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ALTER COLUMN output_port DROP DEFAULT;


