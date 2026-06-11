-- Deploy: schemas/constructive_compute_public/tables/app_function_invocations/columns/owner_id/alterations/alt0000002110
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/app_function_invocations/columns/owner_id/column


COMMENT ON COLUMN "constructive_compute_public".app_function_invocations.owner_id IS E'Entity that owns this invocation (for billing/metering attribution)';

