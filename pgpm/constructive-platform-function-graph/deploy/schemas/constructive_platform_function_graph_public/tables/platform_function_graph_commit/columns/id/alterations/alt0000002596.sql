-- Deploy: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_commit/columns/id/alterations/alt0000002596
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_commit/table
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_commit/columns/id/column


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_commit 
  ALTER COLUMN id SET DEFAULT uuidv7();

