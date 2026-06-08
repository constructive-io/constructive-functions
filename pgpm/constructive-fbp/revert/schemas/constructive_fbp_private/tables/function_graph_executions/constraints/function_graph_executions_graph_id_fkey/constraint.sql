-- Revert: schemas/constructive_fbp_private/tables/function_graph_executions/constraints/function_graph_executions_graph_id_fkey/constraint


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  DROP CONSTRAINT function_graph_executions_graph_id_fkey;


