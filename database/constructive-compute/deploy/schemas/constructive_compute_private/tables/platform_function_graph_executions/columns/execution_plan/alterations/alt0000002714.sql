-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/execution_plan/alterations/alt0000002714
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/execution_plan/column


COMMENT ON COLUMN "constructive_compute_private".platform_function_graph_executions.execution_plan IS E'Pre-computed topological sort as array of wave objects';

