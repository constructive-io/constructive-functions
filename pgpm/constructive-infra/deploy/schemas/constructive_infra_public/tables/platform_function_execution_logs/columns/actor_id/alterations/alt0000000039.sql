-- Deploy: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/actor_id/alterations/alt0000000039
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/actor_id/column


COMMENT ON COLUMN "constructive_infra_public".platform_function_execution_logs.actor_id IS E'User who triggered the execution (NULL for system/cron)';

