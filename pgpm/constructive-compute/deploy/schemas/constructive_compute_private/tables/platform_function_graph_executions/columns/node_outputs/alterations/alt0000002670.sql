-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/node_outputs/alterations/alt0000002670
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/table
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/node_outputs/column


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ALTER COLUMN node_outputs SET DEFAULT '{}'::jsonb;

