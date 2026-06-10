-- Revert: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_ref/columns/store_id/column


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_ref 
  DROP COLUMN store_id RESTRICT;


