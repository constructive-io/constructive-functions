-- Revert: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/id/alterations/alt0000002650


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  ALTER COLUMN id DROP NOT NULL;


