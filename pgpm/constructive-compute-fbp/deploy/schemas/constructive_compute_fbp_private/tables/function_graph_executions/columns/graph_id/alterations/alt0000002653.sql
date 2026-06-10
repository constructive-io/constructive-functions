-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/graph_id/alterations/alt0000002653
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/table
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/graph_id/column


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  ALTER COLUMN graph_id SET NOT NULL;

