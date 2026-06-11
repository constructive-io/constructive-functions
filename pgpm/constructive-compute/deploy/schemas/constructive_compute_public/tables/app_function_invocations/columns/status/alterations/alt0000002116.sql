-- Deploy: schemas/constructive_compute_public/tables/app_function_invocations/columns/status/alterations/alt0000002116
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/app_function_invocations/columns/status/column


COMMENT ON COLUMN "constructive_compute_public".app_function_invocations.status IS E'Lifecycle: pending → running → completed/failed/cancelled';

