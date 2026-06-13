-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/id/alterations/alt0000002652
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/table
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_executions/columns/id/column


ALTER TABLE "constructive_compute_private".platform_function_graph_executions 
  ALTER COLUMN id SET DEFAULT uuidv7();

