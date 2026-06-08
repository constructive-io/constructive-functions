-- Deploy: schemas/constructive_fbp_public/tables/graph_commit/columns/parent_ids/alterations/alt0000000102
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_public/schema
-- requires: schemas/constructive_fbp_public/tables/graph_commit/columns/parent_ids/column


COMMENT ON COLUMN "constructive_fbp_public".graph_commit.parent_ids IS E'Parent commit IDs (supports merge commits)';

