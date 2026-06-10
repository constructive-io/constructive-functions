-- Deploy: schemas/constructive_compute_public/tables/app_function_execution_logs/columns/owner_id/alterations/alt0000002142
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/app_function_execution_logs/columns/owner_id/column


COMMENT ON COLUMN "constructive_compute_public".app_function_execution_logs.owner_id IS 'Entity this log entry belongs to';

