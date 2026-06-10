-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/max_ticks/alterations/alt0000002686
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/max_ticks/column


COMMENT ON COLUMN "constructive_compute_fbp_private".function_graph_executions.max_ticks IS E'Maximum ticks before execution is failed (default 100)';

