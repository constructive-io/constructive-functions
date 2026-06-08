-- Deploy: schemas/constructive_fbp_public/tables/graph_commit/columns/committer_id/alterations/alt0000000092
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_commit/columns/committer_id/column


COMMENT ON COLUMN "constructive_fbp_public".graph_commit.committer_id IS E'User who committed (may differ from author)';

