-- Deploy: schemas/constructive_infra_public/tables/platform_function_invocations/columns/task_identifier/alterations/alt0000000077
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_invocations/columns/task_identifier/column


COMMENT ON COLUMN "constructive_infra_public".platform_function_invocations.task_identifier IS E'Routing slug (scope:name) for the job worker';

