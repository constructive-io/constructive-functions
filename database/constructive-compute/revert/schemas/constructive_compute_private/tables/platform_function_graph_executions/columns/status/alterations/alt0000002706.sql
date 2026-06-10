-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/status/alterations/alt0000002706


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ALTER COLUMN status DROP NOT NULL;


