-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/output_node/alterations/alt0000002659
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/table
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/output_node/column


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  ALTER COLUMN output_node SET NOT NULL;

