-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_object/columns/id/alterations/alt0000002722
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_object/columns/id/column


COMMENT ON COLUMN "constructive_compute_private".platform_execution_tree_object.id IS E'Content-addressed UUID v5 (hash of data + children)';

