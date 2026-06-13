-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_store/columns/created_at/alterations/alt0000002739
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_store/columns/created_at/column


COMMENT ON COLUMN "constructive_compute_private".platform_execution_tree_store.created_at IS E'Timestamp of store creation (partition key)';

