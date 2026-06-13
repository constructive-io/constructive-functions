-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/database_id/alterations/alt0000002704
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_execution_node_states/columns/database_id/column


COMMENT ON COLUMN "constructive_compute_private".platform_function_graph_execution_node_states.database_id IS E'Database scope for multi-tenant isolation';

