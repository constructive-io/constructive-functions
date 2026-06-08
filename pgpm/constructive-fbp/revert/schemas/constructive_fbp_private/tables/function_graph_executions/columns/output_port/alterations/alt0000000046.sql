-- Revert: schemas/constructive_fbp_private/tables/function_graph_executions/columns/output_port/alterations/alt0000000046


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  ALTER COLUMN output_port DROP DEFAULT;


