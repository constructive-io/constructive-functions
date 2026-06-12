-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_execution_outputs/alterations/alt0000002650
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_execution_outputs/table


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_outputs 
  DISABLE ROW LEVEL SECURITY;

