-- Deploy: schemas/constructive_compute_public/tables/platform_function_graph_execution_outputs/columns/id/alterations/alt0000002640
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_execution_outputs/table
-- requires: schemas/constructive_compute_public/tables/platform_function_graph_execution_outputs/columns/id/column


ALTER TABLE "constructive_compute_public".platform_function_graph_execution_outputs 
  ALTER COLUMN id SET DEFAULT uuidv7();

