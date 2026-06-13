-- Deploy: schemas/constructive_compute_public/tables/org_function_invocations/columns/task_identifier/alterations/alt0000002109
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/org_function_invocations/table
-- requires: schemas/constructive_compute_public/tables/org_function_invocations/columns/task_identifier/column


ALTER TABLE "constructive_compute_public".org_function_invocations 
  ALTER COLUMN task_identifier SET NOT NULL;

