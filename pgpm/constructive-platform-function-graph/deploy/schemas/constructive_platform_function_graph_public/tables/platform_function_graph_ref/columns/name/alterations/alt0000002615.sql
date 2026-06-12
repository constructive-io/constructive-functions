-- Deploy: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_ref/columns/name/alterations/alt0000002615
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_ref/table
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_ref/columns/name/column


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_ref 
  ALTER COLUMN name SET NOT NULL;

