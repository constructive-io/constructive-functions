-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_commit/columns/store_id/alterations/alt0000002748
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_commit/columns/store_id/column


COMMENT ON COLUMN "constructive_compute_private".platform_execution_tree_commit.store_id IS E'FK to execution_tree_store';

