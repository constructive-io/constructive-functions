-- Deploy: schemas/constructive_infra_public/tables/platform_function_invocations/columns/job_id/alterations/alt0000000068
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_invocations/columns/job_id/column


COMMENT ON COLUMN "constructive_infra_public".platform_function_invocations.job_id IS E'FK to app_jobs.jobs — the underlying transport';

