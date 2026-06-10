-- Deploy: schemas/constructive_compute_public/tables/org_function_execution_logs/columns/task_identifier/alterations/alt0000002173
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/org_function_execution_logs/columns/task_identifier/column


COMMENT ON COLUMN "constructive_compute_public".org_function_execution_logs.task_identifier IS E'Function routing key (NULL for generic job logs)';

