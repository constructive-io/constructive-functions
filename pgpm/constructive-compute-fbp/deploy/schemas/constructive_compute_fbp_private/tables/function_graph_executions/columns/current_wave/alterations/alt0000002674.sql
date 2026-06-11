-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/current_wave/alterations/alt0000002674
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/table
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/current_wave/column


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  ALTER COLUMN current_wave SET DEFAULT 0;

