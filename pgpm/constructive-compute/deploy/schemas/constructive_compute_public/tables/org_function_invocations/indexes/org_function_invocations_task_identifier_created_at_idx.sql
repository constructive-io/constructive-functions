-- Deploy: schemas/constructive_compute_public/tables/org_function_invocations/indexes/org_function_invocations_task_identifier_created_at_idx
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/org_function_invocations/table
-- requires: schemas/constructive_compute_public/tables/org_function_invocations/columns/created_at/column
-- requires: schemas/constructive_compute_public/tables/org_function_invocations/columns/task_identifier/column


CREATE INDEX org_function_invocations_task_identifier_created_at_idx ON "constructive_compute_public".org_function_invocations USING BTREE ( task_identifier, created_at );

