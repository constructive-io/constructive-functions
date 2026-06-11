-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/timeout_at/alterations/alt0000002690
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/table
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/timeout_at/column


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  ALTER COLUMN timeout_at SET NOT NULL;

