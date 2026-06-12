-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/max_ticks/alterations/alt0000002700
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/max_ticks/column


COMMENT ON COLUMN "constructive_compute_private".platform_function_graph_executions.max_ticks IS E'Maximum ticks before execution is failed (default 100)';

