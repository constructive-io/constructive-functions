-- Deploy: schemas/constructive_fbp_private/tables/function_graph_executions/columns/error_message/alterations/alt0000000024
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_private/schema
-- requires: schemas/constructive_fbp_private/tables/function_graph_executions/columns/error_message/column


COMMENT ON COLUMN "constructive_fbp_private".function_graph_executions.error_message IS E'Human-readable error description when status = failed';

