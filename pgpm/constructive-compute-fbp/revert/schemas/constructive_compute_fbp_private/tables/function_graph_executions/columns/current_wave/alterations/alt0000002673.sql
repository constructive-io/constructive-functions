-- Revert: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/current_wave/alterations/alt0000002673


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  ALTER COLUMN current_wave DROP NOT NULL;


