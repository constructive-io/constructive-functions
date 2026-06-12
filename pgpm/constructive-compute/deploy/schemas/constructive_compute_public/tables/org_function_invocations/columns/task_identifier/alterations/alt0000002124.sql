-- Deploy: schemas/constructive_compute_public/tables/org_function_invocations/columns/task_identifier/alterations/alt0000002124
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/org_function_invocations/columns/task_identifier/column


COMMENT ON COLUMN "constructive_compute_public".org_function_invocations.task_identifier IS E'Function routing slug (scope:name). Links to function_definitions.task_identifier by convention — no FK.';

