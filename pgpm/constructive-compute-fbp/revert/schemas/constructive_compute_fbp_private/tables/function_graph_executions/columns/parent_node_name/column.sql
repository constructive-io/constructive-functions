-- Revert: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/parent_node_name/column


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  DROP COLUMN parent_node_name RESTRICT;


