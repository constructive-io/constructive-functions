-- Deploy: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_commit/columns/date/alterations/alt0000002594
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_commit/table
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_commit/columns/date/column


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_commit 
  ALTER COLUMN date SET DEFAULT CURRENT_TIMESTAMP;

