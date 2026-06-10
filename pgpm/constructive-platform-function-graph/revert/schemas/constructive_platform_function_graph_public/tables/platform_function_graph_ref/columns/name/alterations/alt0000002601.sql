-- Revert: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_ref/columns/name/alterations/alt0000002601


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_ref 
  ALTER COLUMN name DROP NOT NULL;


