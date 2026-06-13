-- Deploy: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/database_id/alterations/alt0000002763
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_execution_tree_ref/columns/database_id/column


COMMENT ON COLUMN "constructive_compute_private".platform_execution_tree_ref.database_id IS E'Scope for multi-tenant isolation';

