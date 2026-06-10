-- Revert: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/status/alterations/alt0000002695


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  DROP CONSTRAINT function_graph_executions_status_chk;


