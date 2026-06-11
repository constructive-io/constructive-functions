-- Revert: schemas/constructive_compute_public/tables/org_function_execution_logs/columns/log_level/column


ALTER TABLE "constructive_compute_public".org_function_execution_logs 
  DROP COLUMN log_level RESTRICT;


