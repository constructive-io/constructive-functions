-- Deploy: schemas/constructive_compute_public/tables/platform_function_execution_logs/indexes/platform_function_execution_logs_invocation_id_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_execution_logs/table
-- requires: schemas/constructive_compute_public/tables/platform_function_execution_logs/columns/created_at/column
-- requires: schemas/constructive_compute_public/tables/platform_function_execution_logs/columns/invocation_id/column


CREATE INDEX platform_function_execution_logs_invocation_id_created_at_idx ON "constructive_compute_public".platform_function_execution_logs USING BTREE ( invocation_id, created_at );

