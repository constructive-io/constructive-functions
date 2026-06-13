-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_object/columns/database_id/alterations/alt0000002724
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_object/columns/database_id/column


COMMENT ON COLUMN "constructive_compute_private".platform_execution_tree_object.database_id IS E'Scope for multi-tenant isolation';

