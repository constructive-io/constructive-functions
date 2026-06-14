-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/output_port/alterations/alt0000002675
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/table
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/output_port/column


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  ALTER COLUMN output_port SET NOT NULL;

