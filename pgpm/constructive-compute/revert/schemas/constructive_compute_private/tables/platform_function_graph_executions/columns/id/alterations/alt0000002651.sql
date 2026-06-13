-- Revert: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/id/alterations/alt0000002651


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ALTER COLUMN id DROP NOT NULL;


