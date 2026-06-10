-- Deploy: schemas/constructive_compute_fbp_public/tables/platform_function_graph_commit/columns/committer_id/alterations/alt0000002591
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_public/schema
-- requires: schemas/constructive_compute_fbp_public/tables/platform_function_graph_commit/columns/committer_id/column


COMMENT ON COLUMN "constructive_compute_fbp_public".platform_function_graph_commit.committer_id IS E'User who committed (may differ from author)';

