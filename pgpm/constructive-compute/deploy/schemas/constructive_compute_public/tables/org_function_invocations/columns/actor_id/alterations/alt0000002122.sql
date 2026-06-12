-- Deploy: schemas/constructive_compute_public/tables/org_function_invocations/columns/actor_id/alterations/alt0000002122
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/org_function_invocations/columns/actor_id/column


COMMENT ON COLUMN "constructive_compute_public".org_function_invocations.actor_id IS E'Who triggered the invocation (NULL for system/cron)';

