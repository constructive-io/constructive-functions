-- Deploy: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/alterations/alt0000000001
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_private/schema
-- requires: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/table


ALTER TABLE "constructive_fbp_private".function_graph_execution_outputs 
  DISABLE ROW LEVEL SECURITY;

