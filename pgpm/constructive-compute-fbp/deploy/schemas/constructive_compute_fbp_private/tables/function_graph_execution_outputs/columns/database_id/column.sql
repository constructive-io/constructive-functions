-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_execution_outputs/columns/database_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_execution_outputs/table


ALTER TABLE "constructive_compute_fbp_private".function_graph_execution_outputs 
  ADD COLUMN database_id uuid;

