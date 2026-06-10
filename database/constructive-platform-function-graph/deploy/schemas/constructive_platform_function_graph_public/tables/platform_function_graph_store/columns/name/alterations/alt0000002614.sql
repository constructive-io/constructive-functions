-- Deploy: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_store/columns/name/alterations/alt0000002614
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_store/table
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_store/columns/name/column


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_store 
  ALTER COLUMN name SET NOT NULL;

