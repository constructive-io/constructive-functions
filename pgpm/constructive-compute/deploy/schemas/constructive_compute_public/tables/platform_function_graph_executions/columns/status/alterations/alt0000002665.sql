-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/status/alterations/alt0000002665
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/table
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/status/column


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  ALTER COLUMN status SET NOT NULL;

