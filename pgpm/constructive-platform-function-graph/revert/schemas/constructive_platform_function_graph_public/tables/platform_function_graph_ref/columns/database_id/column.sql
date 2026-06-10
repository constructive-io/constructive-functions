-- Revert: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_ref/columns/database_id/column


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_ref 
  DROP COLUMN database_id RESTRICT;


