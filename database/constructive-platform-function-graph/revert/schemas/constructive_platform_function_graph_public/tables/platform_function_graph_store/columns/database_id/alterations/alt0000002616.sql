-- Revert: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_store/columns/database_id/alterations/alt0000002616


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_store 
  ALTER COLUMN database_id DROP NOT NULL;


