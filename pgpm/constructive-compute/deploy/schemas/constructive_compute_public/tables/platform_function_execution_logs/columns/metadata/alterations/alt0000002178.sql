-- Deploy: schemas/constructive_compute_public/tables/platform_function_execution_logs/columns/metadata/alterations/alt0000002178
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_execution_logs/columns/metadata/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_execution_logs.metadata IS E'Structured context (labels, trace data, extra fields)';

