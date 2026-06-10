-- Deploy: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/id/alterations/alt0000002651
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_fbp_private/schema
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/table
-- requires: schemas/constructive_compute_fbp_private/tables/function_graph_executions/columns/id/column


ALTER TABLE "constructive_compute_fbp_private".function_graph_executions 
  ALTER COLUMN id SET DEFAULT uuidv7();

