-- Deploy: schemas/constructive_fbp_private/tables/function_graph_executions/columns/error_code/alterations/alt0000000023
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_private/schema
-- requires: schemas/constructive_fbp_private/tables/function_graph_executions/columns/error_code/column


COMMENT ON COLUMN "constructive_fbp_private".function_graph_executions.error_code IS E'Machine-readable error code when status = failed';

