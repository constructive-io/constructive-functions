-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/parent_execution_id/alterations/alt0000002676
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/parent_execution_id/column


COMMENT ON COLUMN "constructive_compute_private".platform_function_graph_executions.parent_execution_id IS E'Parent execution when this is a sub-execution';

