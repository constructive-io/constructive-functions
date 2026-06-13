-- Revert: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_ref/columns/database_id/alterations/alt0000002617


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_ref 
  ALTER COLUMN database_id DROP NOT NULL;


