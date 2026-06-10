-- Revert: schemas/constructive_compute_public/tables/org_function_execution_logs/columns/task_identifier/column


ALTER TABLE "constructive_compute_public".org_function_execution_logs 
  DROP COLUMN task_identifier RESTRICT;


