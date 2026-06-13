-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/status/alterations/alt0000002665
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/table
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/status/column


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ALTER COLUMN status SET NOT NULL;

