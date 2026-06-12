-- Revert: schemas/constructive_compute_public/tables/org_function_invocations/columns/status/alterations/alt0000002126


ALTER TABLE "constructive_compute_public".org_function_invocations 
  ALTER COLUMN status DROP NOT NULL;


