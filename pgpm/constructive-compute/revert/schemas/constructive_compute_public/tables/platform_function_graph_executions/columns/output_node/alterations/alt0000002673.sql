-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/output_node/alterations/alt0000002673


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  ALTER COLUMN output_node DROP NOT NULL;


