-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/output_node/alterations/alt0000002659
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/table
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/output_node/column


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  ALTER COLUMN output_node SET NOT NULL;

