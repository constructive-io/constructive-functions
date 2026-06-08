-- Revert: schemas/constructive_fbp_private/tables/function_graph_executions/columns/current_wave/alterations/alt0000000016


ALTER TABLE "constructive_fbp_private".function_graph_executions 
  ALTER COLUMN current_wave DROP NOT NULL;


