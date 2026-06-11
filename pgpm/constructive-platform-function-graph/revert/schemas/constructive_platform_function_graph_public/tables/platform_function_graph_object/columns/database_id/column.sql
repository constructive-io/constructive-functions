-- Revert: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_object/columns/database_id/column


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_object 
  DROP COLUMN database_id RESTRICT;


