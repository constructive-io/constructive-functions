-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/max_ticks/alterations/alt0000002686


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  ALTER COLUMN max_ticks DROP DEFAULT;


