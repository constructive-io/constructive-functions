-- Deploy: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/task_identifier/alterations/alt0000000054
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/task_identifier/column


COMMENT ON COLUMN "constructive_infra_public".platform_function_execution_logs.task_identifier IS E'Function routing key (NULL for generic job logs)';

