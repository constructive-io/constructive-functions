-- Revert: schemas/constructive_fbp_private/tables/function_graph_executions/columns/output_node/alterations/alt0000000042


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  ALTER COLUMN output_node DROP NOT NULL;


