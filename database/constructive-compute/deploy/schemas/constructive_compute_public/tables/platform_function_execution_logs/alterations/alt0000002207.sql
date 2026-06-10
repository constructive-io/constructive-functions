-- Deploy: schemas/constructive_compute_public/tables/platform_function_execution_logs/alterations/alt0000002207
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/platform_function_execution_logs/table


ALTER TABLE "constructive_compute_public".platform_function_execution_logs 
  DISABLE ROW LEVEL SECURITY;

