-- Deploy: schemas/constructive_fbp_private/tables/function_graph_executions/columns/max_ticks/alterations/alt0000000038
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_private/schema
-- requires: schemas/constructive_fbp_private/tables/function_graph_executions/columns/max_ticks/column


COMMENT ON COLUMN "constructive_fbp_private".function_graph_executions.max_ticks IS E'Maximum ticks before execution is failed (default 100)';

