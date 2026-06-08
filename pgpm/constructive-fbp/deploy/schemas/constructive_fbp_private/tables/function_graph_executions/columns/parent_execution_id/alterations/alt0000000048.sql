-- Deploy: schemas/constructive_fbp_private/tables/function_graph_executions/columns/parent_execution_id/alterations/alt0000000048
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_private/schema
-- requires: schemas/constructive_fbp_private/tables/function_graph_executions/columns/parent_execution_id/column


COMMENT ON COLUMN "constructive_fbp_private".function_graph_executions.parent_execution_id IS E'Parent execution when this is a sub-execution';

