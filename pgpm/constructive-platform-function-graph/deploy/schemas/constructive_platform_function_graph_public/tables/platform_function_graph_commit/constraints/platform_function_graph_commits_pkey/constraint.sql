-- Deploy: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_commit/constraints/platform_function_graph_commits_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_commit/table
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_commit/columns/id/column
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_commit/columns/database_id/column


ALTER TABLE "constructive_platform_function_graph_public".platform_function_graph_commit 
  ADD CONSTRAINT platform_function_graph_commits_pkey PRIMARY KEY (id, database_id);

