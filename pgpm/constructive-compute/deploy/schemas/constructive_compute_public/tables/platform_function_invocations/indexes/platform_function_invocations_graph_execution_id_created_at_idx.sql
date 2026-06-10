-- Deploy: schemas/constructive_compute_public/tables/platform_function_invocations/indexes/platform_function_invocations_graph_execution_id_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_invocations/table
-- requires: schemas/constructive_compute_public/tables/platform_function_invocations/columns/created_at/column
-- requires: schemas/constructive_compute_public/tables/platform_function_invocations/columns/graph_execution_id/column


CREATE INDEX platform_function_invocations_graph_execution_id_created_at_idx ON "constructive_compute_public".platform_function_invocations USING BTREE ( graph_execution_id, created_at );

