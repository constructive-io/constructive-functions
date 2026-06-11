-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/database_id/alterations/alt0000002656
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/table
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/database_id/column


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  ALTER COLUMN database_id SET NOT NULL;

