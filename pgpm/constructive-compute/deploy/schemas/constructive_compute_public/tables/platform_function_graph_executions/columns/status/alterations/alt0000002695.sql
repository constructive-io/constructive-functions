-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/status/alterations/alt0000002695
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/table
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_executions/columns/status/column


ALTER TABLE "constructive_compute_public".platform_function_graph_executions 
  ADD CONSTRAINT platform_function_graph_executions_status_chk 
    CHECK (status IN ( 'pending', 'running', 'completed', 'failed', 'cancelled' ));

