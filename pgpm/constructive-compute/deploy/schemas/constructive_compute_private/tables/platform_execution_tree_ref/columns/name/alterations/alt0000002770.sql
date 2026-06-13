-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/name/alterations/alt0000002770
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/name/column


COMMENT ON COLUMN "constructive_compute_private".platform_execution_tree_ref.name IS E'Ref name (default: main)';

