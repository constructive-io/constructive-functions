-- Deploy: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_object/columns/created_at/alterations/alt0000002606
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_object/table
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_object/columns/created_at/column


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_object 
  ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

