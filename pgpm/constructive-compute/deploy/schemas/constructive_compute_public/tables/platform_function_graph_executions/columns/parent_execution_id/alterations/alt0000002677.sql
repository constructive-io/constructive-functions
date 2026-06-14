-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/parent_execution_id/alterations/alt0000002677
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/parent_execution_id/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_graph_executions.parent_execution_id IS E'Parent execution when this is a sub-execution';

