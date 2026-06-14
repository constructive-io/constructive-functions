-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/tick_count/alterations/alt0000002682
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/tick_count/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_graph_executions.tick_count IS E'Number of evaluate_step ticks executed';

