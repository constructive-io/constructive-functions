-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_execution_outputs/columns/data/alterations/alt0000002645
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_execution_outputs/table
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_execution_outputs/columns/data/column


ALTER TABLE "constructive_compute_public".platform_function_graph_execution_outputs 
  ALTER COLUMN data SET NOT NULL;

