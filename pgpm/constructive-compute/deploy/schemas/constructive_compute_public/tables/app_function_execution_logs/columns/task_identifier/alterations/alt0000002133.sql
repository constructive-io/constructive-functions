-- Deploy: schemas/constructive_compute_public/tables/app_function_execution_logs/columns/task_identifier/alterations/alt0000002133
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/app_function_execution_logs/columns/task_identifier/column


COMMENT ON COLUMN "constructive_compute_public".app_function_execution_logs.task_identifier IS E'Function routing key (NULL for generic job logs)';

