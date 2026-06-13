-- Deploy: schemas/constructive_infra_public/tables/platform_function_invocations/columns/created_at/alterations/alt0000000059
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_invocations/columns/created_at/column


COMMENT ON COLUMN "constructive_infra_public".platform_function_invocations.created_at IS E'Invocation creation timestamp (partition key)';

