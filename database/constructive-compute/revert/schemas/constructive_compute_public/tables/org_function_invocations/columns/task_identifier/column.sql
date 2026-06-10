-- Revert: schemas/constructive_compute_public/tables/org_function_invocations/columns/task_identifier/column


ALTER TABLE "constructive_compute_public".org_function_invocations 
  DROP COLUMN task_identifier RESTRICT;


