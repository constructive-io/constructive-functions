-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/node_outputs/alterations/alt0000002669


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  ALTER COLUMN node_outputs DROP NOT NULL;


