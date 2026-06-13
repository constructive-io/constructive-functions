-- Deploy: schemas/constructive_infra_public/tables/platform_function_execution_logs/alterations/alt0000000037
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_execution_logs/table


ALTER TABLE "constructive_infra_public".platform_function_execution_logs 
  DISABLE ROW LEVEL SECURITY;

