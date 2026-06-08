-- Deploy: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/columns/database_id/alterations/alt0000000006
-- made with <3 @ constructive.io

-- requires: schemas/constructive_fbp_private/schema
-- requires: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/table
-- requires: schemas/constructive_fbp_private/tables/function_graph_execution_outputs/columns/database_id/column


ALTER TABLE "constructive_fbp_private".function_graph_execution_outputs 
  ALTER COLUMN database_id SET NOT NULL;

