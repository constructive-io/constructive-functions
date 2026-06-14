-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_execution_outputs/columns/database_id/alterations/alt0000002643
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_execution_outputs/columns/database_id/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_graph_execution_outputs.database_id IS E'Scope for multi-tenant isolation';

