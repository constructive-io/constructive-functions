-- Deploy: schemas/constructive_compute_public/tables/app_function_execution_logs/columns/invocation_id/alterations/alt0000002132
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/app_function_execution_logs/columns/invocation_id/column


COMMENT ON COLUMN "constructive_compute_public".app_function_execution_logs.invocation_id IS E'Invocation this log entry belongs to (NULL for standalone job logs)';

