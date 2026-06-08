-- Revert: schemas/constructive_fbp_private/tables/function_graph_executions/columns/max_ticks/column


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  DROP COLUMN max_ticks RESTRICT;


