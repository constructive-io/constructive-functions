-- Deploy: schemas/constructive_compute_public/tables/org_function_execution_logs/constraints/org_function_execution_logs_pkey/constraint
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/org_function_execution_logs/table


ALTER TABLE "constructive_compute_public".org_function_execution_logs 
  ADD CONSTRAINT org_function_execution_logs_pkey PRIMARY KEY (created_at, id);

