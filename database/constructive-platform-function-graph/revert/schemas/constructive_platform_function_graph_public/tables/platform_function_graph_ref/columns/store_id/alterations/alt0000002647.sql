-- Revert: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_ref/columns/store_id/alterations/alt0000002647


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_ref 
  ALTER COLUMN store_id DROP NOT NULL;


