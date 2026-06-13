-- Deploy: schemas/constructive_infra_public/tables/platform_function_invocations/columns/duration_ms/alterations/alt0000000062
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_invocations/columns/duration_ms/column


COMMENT ON COLUMN "constructive_infra_public".platform_function_invocations.duration_ms IS E'Wall-clock execution time in milliseconds';

