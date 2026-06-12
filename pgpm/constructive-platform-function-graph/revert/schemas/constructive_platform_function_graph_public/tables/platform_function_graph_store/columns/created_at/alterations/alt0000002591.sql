-- Revert: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_store/columns/created_at/alterations/alt0000002591


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_store 
  ALTER COLUMN created_at DROP DEFAULT;


