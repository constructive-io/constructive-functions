-- Deploy: schemas/constructive_compute_public/tables/org_function_execution_logs/columns/log_level/alterations/alt0000002146
-- made with <3 @ constructive.io

-- requires: schemas/constructive_compute_public/schema
-- requires: schemas/constructive_compute_public/tables/org_function_execution_logs/table
-- requires: schemas/constructive_compute_public/tables/org_function_execution_logs/columns/log_level/column


ALTER TABLE "constructive_compute_public".org_function_execution_logs 
  ALTER COLUMN log_level SET NOT NULL;

