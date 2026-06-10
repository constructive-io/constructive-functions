-- Revert: schemas/constructive_compute_public/tables/org_function_execution_logs/columns/invocation_id/column


ALTER TABLE "constructive_compute_public".org_function_execution_logs 
  DROP COLUMN invocation_id RESTRICT;


