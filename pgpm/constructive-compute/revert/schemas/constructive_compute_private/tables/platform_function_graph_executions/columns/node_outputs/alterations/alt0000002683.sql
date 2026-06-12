-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/node_outputs/alterations/alt0000002683


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ALTER COLUMN node_outputs DROP NOT NULL;


