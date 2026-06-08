-- Deploy: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/columns/database_id/alterations/alt0000000007
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_private/schema
-- requires: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/columns/database_id/column


COMMENT ON COLUMN "constructive_fbp_private".function_graph_execution_outputs.database_id IS E'Database scope for multi-tenant isolation';

