-- Deploy: schemas/constructive_fbp_private/tables/function_graph_executions/columns/status/alterations/alt0000000054
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_private/schema
-- requires: schemas/constructive_fbp_private/tables/function_graph_executions/table
-- requires: schemas/constructive_fbp_private/tables/function_graph_executions/columns/status/column


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  ADD CONSTRAINT function_graph_executions_status_chk 
    CHECK (status IN ( 'pending', 'running', 'completed', 'failed', 'cancelled' ));

