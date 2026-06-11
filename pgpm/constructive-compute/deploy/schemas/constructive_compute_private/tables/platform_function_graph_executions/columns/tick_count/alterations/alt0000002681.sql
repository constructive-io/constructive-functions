-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/tick_count/alterations/alt0000002681
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/tick_count/column


COMMENT ON COLUMN "constructive_compute_private".platform_function_graph_executions.tick_count IS E'Number of evaluate_step ticks executed';

