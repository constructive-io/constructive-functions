-- Deploy: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_store/columns/created_at/alterations/alt0000002591
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_store/table
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_store/columns/created_at/column


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_store 
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

