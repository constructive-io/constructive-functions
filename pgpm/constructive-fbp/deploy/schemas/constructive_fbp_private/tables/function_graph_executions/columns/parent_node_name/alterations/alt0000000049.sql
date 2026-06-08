-- Deploy: schemas/constructive_fbp_private/tables/function_graph_executions/columns/parent_node_name/alterations/alt0000000049
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_private/schema
-- requires: schemas/constructive_fbp_private/tables/function_graph_executions/columns/parent_node_name/column


COMMENT ON COLUMN "constructive_fbp_private".function_graph_executions.parent_node_name IS E'Node name in parent execution that spawned this sub-execution';

