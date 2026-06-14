-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/current_wave/alterations/alt0000002675
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/table
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/current_wave/column


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  ALTER COLUMN current_wave SET DEFAULT 0;

