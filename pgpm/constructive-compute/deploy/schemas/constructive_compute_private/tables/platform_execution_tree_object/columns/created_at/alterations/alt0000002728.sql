-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_object/columns/created_at/alterations/alt0000002728
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_object/columns/created_at/column


COMMENT ON COLUMN "constructive_compute_private".platform_execution_tree_object.created_at IS E'Timestamp of object creation (partition key)';

