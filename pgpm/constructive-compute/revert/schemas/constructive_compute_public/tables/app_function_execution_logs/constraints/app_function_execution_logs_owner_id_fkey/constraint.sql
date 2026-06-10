-- Revert: schemas/constructive_compute_public/tables/app_function_execution_logs/constraints/app_function_execution_logs_owner_id_fkey/constraint


ALTER TABLE "constructive_compute_public".app_function_execution_logs 
  DROP CONSTRAINT app_function_execution_logs_owner_id_fkey;


