-- Deploy: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_commit/alterations/alt0000002622
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_commit/table


COMMENT ON TABLE "constructive_platform_function_graph_public".platform_function_graph_commit IS E'Commit history — each commit snapshots a tree root for a store';

