-- Deploy: schemas/constructive_infra_public/tables/platform_function_execution_logs/constraints/platform_function_execution_logs_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_infra_public/schema
-- requires: schemas/constructive_infra_public/tables/platform_function_execution_logs/table


ALTER TABLE "constructive_infra_public".platform_function_execution_logs 
  ADD CONSTRAINT platform_function_execution_logs_pkey PRIMARY KEY (created_at, id);

