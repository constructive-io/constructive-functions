-- Deploy: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_commit/columns/parent_ids/alterations/alt0000002631
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_commit/columns/parent_ids/column


COMMENT ON COLUMN "constructive_platform_function_graph_public".platform_function_graph_commit.parent_ids IS E'Parent commit IDs (supports merge commits)';

