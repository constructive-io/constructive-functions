-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/error_code/alterations/alt0000002735
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/error_code/column


COMMENT ON COLUMN "constructive_compute_private".platform_function_graph_executions.error_code IS E'Machine-readable error code when status = failed';

