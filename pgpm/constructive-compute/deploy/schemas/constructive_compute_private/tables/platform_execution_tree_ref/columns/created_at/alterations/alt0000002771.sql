-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/created_at/alterations/alt0000002771
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/created_at/column


COMMENT ON COLUMN "constructive_compute_private".platform_execution_tree_ref.created_at IS E'Row creation timestamp (partition key)';

