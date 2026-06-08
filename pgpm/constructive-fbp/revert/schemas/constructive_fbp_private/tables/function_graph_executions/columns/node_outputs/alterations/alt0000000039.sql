-- Revert: schemas/constructive_fbp_private/tables/function_graph_executions/columns/node_outputs/alterations/alt0000000039


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  ALTER COLUMN node_outputs DROP NOT NULL;


