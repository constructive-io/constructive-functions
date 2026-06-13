-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/status/alterations/alt0000002697
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/table
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/status/column


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ADD CONSTRAINT platform_function_graph_executions_status_chk 
    CHECK (status IN ( 'pending', 'running', 'completed', 'failed', 'cancelled' ));

