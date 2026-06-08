-- Revert: schemas/constructive_fbp_private/tables/function_graph_executions/columns/output_port/column


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  DROP COLUMN output_port RESTRICT;


