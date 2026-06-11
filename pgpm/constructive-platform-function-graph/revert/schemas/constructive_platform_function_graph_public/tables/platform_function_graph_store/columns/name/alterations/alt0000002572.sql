-- Revert: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_store/columns/name/alterations/alt0000002572


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_store 
  ALTER COLUMN name DROP NOT NULL;


