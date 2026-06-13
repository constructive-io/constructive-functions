-- Deploy: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/database_id/alterations/alt0000000042
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/database_id/column


COMMENT ON COLUMN "constructive_infra_public".platform_function_execution_logs.database_id IS 'Database this log entry belongs to';

