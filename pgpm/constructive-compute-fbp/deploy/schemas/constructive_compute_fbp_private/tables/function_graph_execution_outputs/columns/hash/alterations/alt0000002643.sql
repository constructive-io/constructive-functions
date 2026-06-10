-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_execution_outputs/columns/hash/alterations/alt0000002643
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_execution_outputs/table
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_execution_outputs/columns/hash/column


ALTER TABLE "constructive_compute_fbp_private".function_graph_execution_outputs 
  ALTER COLUMN hash SET NOT NULL;

