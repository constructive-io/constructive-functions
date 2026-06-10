-- Deploy: schemas/constructive_compute_public/tables/platform_function_invocations/columns/database_id/alterations/alt0000002191
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_invocations/columns/database_id/column


COMMENT ON COLUMN "constructive_compute_public".platform_function_invocations.database_id IS E'Database that owns this resource (database-scoped isolation)';

