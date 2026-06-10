-- Revert: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/output_payload/column


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  DROP COLUMN output_payload RESTRICT;


