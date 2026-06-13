-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_commit/columns/message/alterations/alt0000002752
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_commit/columns/message/column


COMMENT ON COLUMN "constructive_compute_private".platform_execution_tree_commit.message IS E'Commit message (e.g. "tick 3: completed add_node, double_node")';

