-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/max_ticks/alterations/alt0000002698
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/table
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/max_ticks/column


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ALTER COLUMN max_ticks SET NOT NULL;

