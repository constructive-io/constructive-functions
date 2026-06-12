-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/database_id/alterations/alt0000002671
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/database_id/column


COMMENT ON COLUMN "constructive_compute_private".platform_function_graph_executions.database_id IS E'Database scope for multi-tenant isolation';

