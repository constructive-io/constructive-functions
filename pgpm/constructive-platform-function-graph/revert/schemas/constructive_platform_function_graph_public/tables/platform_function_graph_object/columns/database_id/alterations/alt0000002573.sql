-- Revert: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_object/columns/database_id/alterations/alt0000002573


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_object 
  ALTER COLUMN database_id DROP NOT NULL;


