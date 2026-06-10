-- Deploy: schemas/constructive_compute_public/tables/platform_function_execution_logs/columns/created_at/alterations/alt0000002212
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_execution_logs/columns/created_at/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_execution_logs.created_at IS E'Log entry timestamp (partition key)';

