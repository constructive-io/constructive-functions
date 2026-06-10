-- Revert: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_commit/columns/database_id/alterations/alt0000002627


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_commit 
  ALTER COLUMN database_id DROP NOT NULL;


