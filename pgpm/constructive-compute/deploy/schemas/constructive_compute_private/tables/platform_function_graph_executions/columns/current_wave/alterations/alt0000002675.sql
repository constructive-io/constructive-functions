-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/current_wave/alterations/alt0000002675
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/current_wave/column


COMMENT ON COLUMN "constructive_compute_private".platform_function_graph_executions.current_wave IS E'Index into execution_plan — tick only processes this wave';

