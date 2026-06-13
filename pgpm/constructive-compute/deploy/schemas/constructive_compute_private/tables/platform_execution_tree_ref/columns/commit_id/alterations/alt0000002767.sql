-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/commit_id/alterations/alt0000002767
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/commit_id/column


COMMENT ON COLUMN "constructive_compute_private".platform_execution_tree_ref.commit_id IS 'Current commit this ref points to';

