-- Revert: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_commit/columns/store_id/alterations/alt0000002601


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_commit 
  ALTER COLUMN store_id DROP NOT NULL;


