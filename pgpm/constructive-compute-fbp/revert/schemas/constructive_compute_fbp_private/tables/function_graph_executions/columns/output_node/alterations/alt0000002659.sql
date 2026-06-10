-- Revert: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/output_node/alterations/alt0000002659


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  ALTER COLUMN output_node DROP NOT NULL;


