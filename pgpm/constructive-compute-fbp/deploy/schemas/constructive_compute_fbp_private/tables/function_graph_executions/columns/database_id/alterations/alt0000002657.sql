-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/database_id/alterations/alt0000002657
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/database_id/column


COMMENT ON COLUMN "constructive_compute_fbp_private".function_graph_executions.database_id IS E'Database scope for multi-tenant isolation';

