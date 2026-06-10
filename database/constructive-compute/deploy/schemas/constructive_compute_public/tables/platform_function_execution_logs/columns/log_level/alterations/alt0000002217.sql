-- Deploy: schemas/constructive_compute_public/tables/platform_function_execution_logs/columns/log_level/alterations/alt0000002217
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_execution_logs/columns/log_level/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_execution_logs.log_level IS E'Log severity: debug, info, warn, error';

