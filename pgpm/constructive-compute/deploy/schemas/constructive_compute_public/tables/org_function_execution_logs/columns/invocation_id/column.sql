-- Deploy: schemas/constructive_compute_public/tables/org_function_execution_logs/columns/invocation_id/column
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/org_function_execution_logs/table


ALTER TABLE "constructive_compute_public".org_function_execution_logs 
  ADD COLUMN invocation_id uuid;

