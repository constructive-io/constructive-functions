-- Revert: schemas/constructive_fbp_private/tables/function_graph_executions/columns/status/alterations/alt0000000054


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  DROP CONSTRAINT function_graph_executions_status_chk;


