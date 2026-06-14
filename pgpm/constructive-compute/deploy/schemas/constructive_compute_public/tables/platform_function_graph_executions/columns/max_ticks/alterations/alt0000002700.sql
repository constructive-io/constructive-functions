-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/max_ticks/alterations/alt0000002700
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/max_ticks/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_graph_executions.max_ticks IS E'Maximum ticks before execution is failed (default 100)';

