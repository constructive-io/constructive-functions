-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/status/alterations/alt0000002737


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  DROP CONSTRAINT platform_function_graph_executions_status_chk;


