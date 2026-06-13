-- Deploy: schemas/constructive_infra_public/tables/platform_function_invocations/columns/actor_id/alterations/alt0000000057
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_invocations/columns/actor_id/column


COMMENT ON COLUMN "constructive_infra_public".platform_function_invocations.actor_id IS 'Who triggered the invocation';

