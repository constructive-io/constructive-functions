-- Deploy: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_object/columns/database_id/alterations/alt0000002601
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_object/table
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_object/columns/database_id/column


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_object 
  ALTER COLUMN database_id SET NOT NULL;

