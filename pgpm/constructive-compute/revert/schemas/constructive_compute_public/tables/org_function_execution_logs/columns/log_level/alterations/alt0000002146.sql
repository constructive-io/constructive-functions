-- Revert: schemas/constructive_compute_public/tables/org_function_execution_logs/columns/log_level/alterations/alt0000002146


ALTER TABLE "constructive_compute_public".org_function_execution_logs 
  ALTER COLUMN log_level DROP NOT NULL;


