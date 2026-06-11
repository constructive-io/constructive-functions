-- Deploy: schemas/constructive_compute_public/tables/platform_function_execution_logs/columns/log_level/alterations/alt0000002174
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_execution_logs/table
-- requires: schemas/constructive_compute_public/tables/platform_function_execution_logs/columns/log_level/column


ALTER TABLE "constructive_compute_public".platform_function_execution_logs 
  ALTER COLUMN log_level SET DEFAULT 'info';

