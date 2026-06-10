-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/tick_count/alterations/alt0000002721
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/table
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/tick_count/column


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ALTER COLUMN tick_count SET NOT NULL;

