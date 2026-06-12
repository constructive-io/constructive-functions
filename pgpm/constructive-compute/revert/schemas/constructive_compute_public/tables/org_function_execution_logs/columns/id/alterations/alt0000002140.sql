-- Revert: schemas/constructive_compute_public/tables/org_function_execution_logs/columns/id/alterations/alt0000002140


ALTER TABLE "constructive_compute_public".org_function_execution_logs 
  ALTER COLUMN id DROP NOT NULL;


