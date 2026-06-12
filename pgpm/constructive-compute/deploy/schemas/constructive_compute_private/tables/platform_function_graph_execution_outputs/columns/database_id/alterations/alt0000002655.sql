-- Deploy: schemas/constructive_compute_private/tables/platform_function_graph_execution_outputs/columns/database_id/alterations/alt0000002655
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_private/schema
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_execution_outputs/table
-- requires: schemas/constructive_compute_private/tables/platform_function_graph_execution_outputs/columns/database_id/column


ALTER TABLE "constructive_compute_private".platform_function_graph_execution_outputs 
  ALTER COLUMN database_id SET NOT NULL;

