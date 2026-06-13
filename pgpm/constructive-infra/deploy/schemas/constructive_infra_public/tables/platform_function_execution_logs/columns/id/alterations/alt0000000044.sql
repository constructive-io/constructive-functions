-- Deploy: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/id/alterations/alt0000000044
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_execution_logs/table
-- requires: schemas/constructive_infra_public/tables/platform_function_execution_logs/columns/id/column


ALTER TABLE "constructive_infra_public".platform_function_execution_logs 
  ALTER COLUMN id SET DEFAULT uuidv7();

