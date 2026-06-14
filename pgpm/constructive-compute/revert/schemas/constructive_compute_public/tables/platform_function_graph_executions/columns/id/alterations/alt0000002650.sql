-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/id/alterations/alt0000002650


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  ALTER COLUMN id DROP NOT NULL;


