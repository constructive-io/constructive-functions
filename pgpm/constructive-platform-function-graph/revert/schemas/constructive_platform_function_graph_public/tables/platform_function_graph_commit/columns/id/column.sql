-- Revert: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_commit/columns/id/column


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_commit 
  DROP COLUMN id RESTRICT;


