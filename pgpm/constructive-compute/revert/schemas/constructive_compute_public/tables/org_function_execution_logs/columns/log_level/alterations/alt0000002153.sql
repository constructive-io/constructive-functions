-- Revert: schemas/constructive_compute_public/tables/org_function_execution_logs/columns/log_level/alterations/alt0000002153


ALTER TABLE "constructive_compute_public".org_function_execution_logs 
  DROP CONSTRAINT org_function_execution_logs_log_level_chk;


