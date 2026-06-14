-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/tick_count/alterations/alt0000002679
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/table
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/tick_count/column


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  ALTER COLUMN tick_count SET NOT NULL;

