-- Revert: schemas/constructive_compute_public/tables/org_function_invocations/columns/task_identifier/alterations/alt0000002123


ALTER TABLE "constructive_compute_public".org_function_invocations 
  ALTER COLUMN task_identifier DROP NOT NULL;


