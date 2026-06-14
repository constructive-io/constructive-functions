-- Revert: schemas/constructive_compute_public/tables/platform_function_graph_execution_outputs/columns/database_id/alterations/alt0000002641


ALTER TABLE "constructive_compute_public".platform_function_graph_execution_outputs 
  ALTER COLUMN database_id DROP NOT NULL;


