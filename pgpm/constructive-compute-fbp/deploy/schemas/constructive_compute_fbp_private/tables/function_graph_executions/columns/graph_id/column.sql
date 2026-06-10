-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/graph_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/table


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  ADD COLUMN graph_id uuid;

