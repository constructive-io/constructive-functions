-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_execution_outputs/columns/data/alterations/alt0000002645
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_execution_outputs/table
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_execution_outputs/columns/data/column


ALTER TABLE "constructive_compute_fbp_private".function_graph_execution_outputs 
  ALTER COLUMN data SET NOT NULL;

