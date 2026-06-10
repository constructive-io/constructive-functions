-- Deploy: schemas/constructive_compute_public/tables/app_function_execution_logs/alterations/alt0000002126
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/app_function_execution_logs/table


ALTER TABLE "constructive_compute_public".app_function_execution_logs 
  DISABLE ROW LEVEL SECURITY;

