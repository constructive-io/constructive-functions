-- Revert: schemas/constructive_compute_public/tables/org_function_execution_logs/columns/message/alterations/alt0000002135


ALTER TABLE "constructive_compute_public".org_function_execution_logs 
  ALTER COLUMN message DROP NOT NULL;


