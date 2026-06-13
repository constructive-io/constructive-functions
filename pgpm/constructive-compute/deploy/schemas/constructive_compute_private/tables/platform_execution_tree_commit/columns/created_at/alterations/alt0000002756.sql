-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_commit/columns/created_at/alterations/alt0000002756
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_commit/columns/created_at/column


COMMENT ON COLUMN "constructive_compute_private".platform_execution_tree_commit.created_at IS E'Row creation timestamp (partition key)';

