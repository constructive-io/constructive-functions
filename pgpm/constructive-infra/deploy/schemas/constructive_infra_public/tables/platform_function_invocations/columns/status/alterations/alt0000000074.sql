-- Deploy: schemas/constructive_infra_public/tables/platform_function_invocations/columns/status/alterations/alt0000000074
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_invocations/columns/status/column


COMMENT ON COLUMN "constructive_infra_public".platform_function_invocations.status IS E'Lifecycle: pending → running → completed/failed/cancelled';

