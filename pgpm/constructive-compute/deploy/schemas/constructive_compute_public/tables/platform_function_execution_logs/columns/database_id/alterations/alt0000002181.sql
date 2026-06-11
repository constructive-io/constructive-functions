-- Deploy: schemas/constructive_compute_public/tables/platform_function_execution_logs/columns/database_id/alterations/alt0000002181
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_execution_logs/columns/database_id/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_execution_logs.database_id IS E'Database that owns this resource (database-scoped isolation)';

