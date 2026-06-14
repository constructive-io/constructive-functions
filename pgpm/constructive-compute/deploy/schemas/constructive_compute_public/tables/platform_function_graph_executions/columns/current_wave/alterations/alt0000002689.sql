-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/current_wave/alterations/alt0000002689
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/current_wave/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_graph_executions.current_wave IS E'Index into execution_plan — tick only processes this wave';

