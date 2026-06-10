-- Revert: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_store/columns/created_at/column


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_store 
  DROP COLUMN created_at RESTRICT;


