-- Deploy: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_commit/columns/message/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_commit/table


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_commit 
  ADD COLUMN message text;

