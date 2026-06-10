-- Deploy: schemas/constructive_compute_public/tables/platform_function_execution_logs/columns/log_level/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_execution_logs/table


ALTER TABLE "constructive_compute_public".platform_function_execution_logs 
  ADD COLUMN log_level text;

