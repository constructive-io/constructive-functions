-- Deploy: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_commit/columns/committer_id/alterations/alt0000002633
-- made with <3 @ constructive.io

-- requires: schemas/constructive_platform_function_graph_public/schema
-- requires: schemas/constructive_platform_function_graph_public/tables/platform_function_graph_commit/columns/committer_id/column


COMMENT ON COLUMN "constructive_platform_function_graph_public".platform_function_graph_commit.committer_id IS E'User who committed (may differ from author)';

