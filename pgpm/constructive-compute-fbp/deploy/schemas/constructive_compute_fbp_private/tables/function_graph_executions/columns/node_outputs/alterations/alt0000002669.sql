-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/node_outputs/alterations/alt0000002669
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/table
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/node_outputs/column


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  ALTER COLUMN node_outputs SET NOT NULL;

