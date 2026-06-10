-- Revert: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_commit/columns/date/alterations/alt0000002635


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_commit 
  ALTER COLUMN date DROP NOT NULL;


