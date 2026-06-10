-- Deploy: schemas/constructive_compute_public/tables/app_function_execution_logs/columns/actor_id/alterations/alt0000002140
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/app_function_execution_logs/columns/actor_id/column


COMMENT ON COLUMN "constructive_compute_public".app_function_execution_logs.actor_id IS E'User who triggered the execution (NULL for system/cron)';

