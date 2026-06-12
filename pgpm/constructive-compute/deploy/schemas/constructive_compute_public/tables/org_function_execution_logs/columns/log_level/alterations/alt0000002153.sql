-- Deploy: schemas/constructive_compute_public/tables/org_function_execution_logs/columns/log_level/alterations/alt0000002153
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/org_function_execution_logs/table
-- requires: schemas/constructive_compute_public/tables/org_function_execution_logs/columns/log_level/column


ALTER TABLE "constructive_compute_public".org_function_execution_logs 
  ADD CONSTRAINT org_function_execution_logs_log_level_chk 
    CHECK (log_level IN ( 'debug', 'info', 'warn', 'error' ));

