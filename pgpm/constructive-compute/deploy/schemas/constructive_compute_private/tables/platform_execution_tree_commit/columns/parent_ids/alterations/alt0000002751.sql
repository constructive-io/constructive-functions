-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_commit/columns/parent_ids/alterations/alt0000002751
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_commit/columns/parent_ids/column


COMMENT ON COLUMN "constructive_compute_private".platform_execution_tree_commit.parent_ids IS E'Parent commit IDs (links to previous tick commit)';

